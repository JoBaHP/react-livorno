const db = require("../config/db");

let categoryTableChecked = false;

async function ensureCategoryTableExists() {
  if (categoryTableChecked) return;
  await db.query(`CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    sort_order INT NOT NULL
  )`);
  await db.query(
    "ALTER TABLE IF EXISTS menu_categories ADD COLUMN IF NOT EXISTS parent_key VARCHAR(32) NOT NULL DEFAULT 'food'"
  );
  categoryTableChecked = true;
}

async function ensureCategoryEntry(category) {
  if (!category) return null;
  await ensureCategoryTableExists();
  const existing = await db.query(
    "SELECT id, sort_order FROM menu_categories WHERE name = $1",
    [category]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const maxResult = await db.query(
    "SELECT COALESCE(MAX(sort_order), -1) AS max FROM menu_categories"
  );
  const currentMax = maxResult.rows[0]?.max ?? -1;
  const nextOrder = currentMax + 1;
  const insertResult = await db.query(
    "INSERT INTO menu_categories (name, sort_order) VALUES ($1, $2) RETURNING id, sort_order",
    [category, nextOrder]
  );
  return insertResult.rows[0];
}

async function syncCategoriesFromMenuItems() {
  await ensureCategoryTableExists();
  const distinctCategories = await db.query(
    "SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL"
  );
  for (const row of distinctCategories.rows) {
    const category = row.category;
    // eslint-disable-next-line no-await-in-loop
    await ensureCategoryEntry(category);
  }
}

exports.getMenu = async (req, res) => {
  try {
    await syncCategoriesFromMenuItems();
    const mode = req.query.mode || '';
    const isPaged = mode === 'admin' || req.query.page || req.query.limit;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const rawSort = (req.query.sort || 'asc').toLowerCase();
    const sortDir = rawSort === 'desc' ? 'DESC' : 'ASC';
    const categoryFilter = req.query.category;

    const params = [];
    let whereClause = '';
    if (categoryFilter) {
      if (categoryFilter === '__null__') {
        whereClause = 'WHERE menu_items.category IS NULL';
      } else {
        params.push(categoryFilter);
        whereClause = `WHERE menu_items.category = $${params.length}`;
      }
    }

    const countQuery = `SELECT COUNT(*) FROM menu_items ${whereClause}`;
    let total = null;
    let totalPages = 1;
    let paginationParams = [];
    const baseFromClause = `FROM menu_items
    LEFT JOIN menu_categories mc ON menu_items.category = mc.name`;
    let orderClause = "ORDER BY menu_items.id ASC";

    if (isPaged) {
      const countResult = await db.query(countQuery, params);
      total = parseInt(countResult.rows[0].count, 10);
      totalPages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;
      if (sortDir === 'DESC') {
        orderClause = `ORDER BY CASE WHEN menu_items.category IS NULL THEN 1 ELSE 0 END,
          CASE WHEN mc.sort_order IS NULL THEN NULL ELSE mc.sort_order END DESC NULLS LAST,
          COALESCE(menu_items.category, '') DESC,
          menu_items.name ASC`;
      } else {
        orderClause = `ORDER BY CASE WHEN menu_items.category IS NULL THEN 1 ELSE 0 END,
          CASE WHEN mc.sort_order IS NULL THEN NULL ELSE mc.sort_order END ASC NULLS LAST,
          COALESCE(menu_items.category, '') ASC,
          menu_items.name ASC`;
      }
      paginationParams = [limit, offset];
    }

    const menuQuery = `SELECT menu_items.*, mc.sort_order ${baseFromClause} ${whereClause} ${orderClause}`;
    const menuQueryParams = params.slice();
    if (isPaged) {
      const limitPlaceholder = params.length + 1;
      const offsetPlaceholder = params.length + 2;
      menuQueryParams.push(...paginationParams);
      const paginatedQuery = `${menuQuery} LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`;
      const menuItemsResult = await db.query(paginatedQuery, menuQueryParams);
      const menuItems = menuItemsResult.rows;

      const itemsWithOptions = await Promise.all(
        menuItems.map(async (item) => {
          const optionsResult = await db.query(
            "SELECT o.id, o.name, o.price FROM options o JOIN menu_item_options mo ON o.id = mo.option_id WHERE mo.menu_item_id = $1",
            [item.id]
          );
          return { ...item, options: optionsResult.rows };
        })
      );

      const categoriesResult = await db.query(
        "SELECT name, sort_order FROM menu_categories ORDER BY sort_order ASC, name ASC"
      );
      const categories = categoriesResult.rows.map((row) => ({
        name: row.name,
        sortOrder: row.sort_order,
      }));
      const uncategorizedResult = await db.query(
        "SELECT EXISTS (SELECT 1 FROM menu_items WHERE category IS NULL) AS has_uncategorized"
      );
      if (uncategorizedResult.rows[0]?.has_uncategorized) {
        categories.push({ name: null, sortOrder: null });
      }

      return res.json({
        items: itemsWithOptions,
        page,
        total,
        totalPages,
        limit,
        categories,
      });
    }

    const menuItemsResult = await db.query(menuQuery, menuQueryParams);
    const menuItems = menuItemsResult.rows;

    const menuWithOptions = await Promise.all(
      menuItems.map(async (item) => {
        const optionsResult = await db.query(
          "SELECT o.id, o.name, o.price FROM options o JOIN menu_item_options mo ON o.id = mo.option_id WHERE mo.menu_item_id = $1",
          [item.id]
        );
        return { ...item, options: optionsResult.rows };
      })
    );

    return res.json(menuWithOptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMenuCategories = async (req, res) => {
  try {
    await syncCategoriesFromMenuItems();
    const { rows } = await db.query(
      "SELECT name, sort_order, parent_key FROM menu_categories ORDER BY sort_order ASC, name ASC"
    );
    const categories = rows.map((row) => ({
      name: row.name,
      sortOrder: row.sort_order,
      parentKey: row.parent_key,
    }));
    const { rows: uncategorizedCheck } = await db.query(
      "SELECT EXISTS (SELECT 1 FROM menu_items WHERE category IS NULL) AS has_uncategorized"
    );
    if (uncategorizedCheck[0]?.has_uncategorized) {
      categories.push({ name: null, sortOrder: null, parentKey: 'food' });
    }
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching menu categories:', err);
    res.status(500).json({ message: 'Failed to fetch menu categories' });
  }
};

exports.addMenuItem = async (req, res) => {
  const {
    name,
    category,
    description,
    price,
    sizes,
    available,
    options,
    imageUrl,
  } = req.body;
  const client = await db.query("BEGIN");
  try {
    const itemResult = await db.query(
      "INSERT INTO menu_items (name, category, description, price, sizes, available, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        name,
        category,
        description,
        price || null,
        sizes ? JSON.stringify(sizes) : null,
        available,
        imageUrl,
      ]
    );
    const newItem = itemResult.rows[0];

    if (options && options.length > 0) {
      for (const optionId of options) {
        await db.query(
          "INSERT INTO menu_item_options (menu_item_id, option_id) VALUES ($1, $2)",
          [newItem.id, optionId]
        );
      }
    }

    await db.query("COMMIT");
    res.status(201).json(newItem);
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    price,
    sizes,
    available,
    options,
    imageUrl,
  } = req.body;
  const client = await db.query("BEGIN");
  try {
    const itemResult = await db.query(
      "UPDATE menu_items SET name = $1, category = $2, description = $3, price = $4, sizes = $5, available = $6, image_url = $7 WHERE id = $8 RETURNING *",
      [
        name,
        category,
        description,
        price || null,
        sizes ? JSON.stringify(sizes) : null,
        available,
        imageUrl,
        id,
      ]
    );
    const updatedItem = itemResult.rows[0];

    await db.query("DELETE FROM menu_item_options WHERE menu_item_id = $1", [
      id,
    ]);
    if (options && options.length > 0) {
      for (const optionId of options) {
        await db.query(
          "INSERT INTO menu_item_options (menu_item_id, option_id) VALUES ($1, $2)",
          [id, optionId]
        );
      }
    }

    await db.query("COMMIT");
    res.json(updatedItem);
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM menu_items WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.reorderCategories = async (req, res) => {
  let transactionStarted = false;
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const cleaned = order
      .map((name) => (typeof name === 'string' ? name.trim() : ''))
      .filter((name) => name.length > 0);

    await syncCategoriesFromMenuItems();

    const existingResult = await db.query(
      'SELECT name FROM menu_categories ORDER BY sort_order ASC, name ASC'
    );
    const existingNames = existingResult.rows.map((row) => row.name);

    const remaining = existingNames.filter((name) => !cleaned.includes(name));
    const finalOrder = [...cleaned, ...remaining];

    await db.query('BEGIN');
    transactionStarted = true;
    for (let index = 0; index < finalOrder.length; index += 1) {
      const name = finalOrder[index];
      // eslint-disable-next-line no-await-in-loop
      await ensureCategoryEntry(name);
      // eslint-disable-next-line no-await-in-loop
      await db.query('UPDATE menu_categories SET sort_order = $1 WHERE name = $2', [
        index,
        name,
      ]);
    }
    await db.query('COMMIT');

    return res.json({ success: true, order: finalOrder });
  } catch (err) {
    try {
      // Roll back only if a transaction was started in this scope
      if (transactionStarted) {
        await db.query('ROLLBACK');
      }
    } catch (rollbackError) {
      console.error('Rollback failed', rollbackError);
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
