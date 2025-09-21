const db = require("../config/db");

exports.getMenu = async (req, res) => {
  try {
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
        whereClause = 'WHERE category IS NULL';
      } else {
        params.push(categoryFilter);
        whereClause = `WHERE category = $${params.length}`;
      }
    }

    const countQuery = `SELECT COUNT(*) FROM menu_items ${whereClause}`;
    let total = null;
    let totalPages = 1;
    let paginationParams = [];
    let orderClause = "ORDER BY id ASC";

    if (isPaged) {
      const countResult = await db.query(countQuery, params);
      total = parseInt(countResult.rows[0].count, 10);
      totalPages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;
      orderClause = `ORDER BY COALESCE(category, '') ${sortDir}, name ASC`;
      paginationParams = [limit, offset];
    }

    const menuQuery = `SELECT * FROM menu_items ${whereClause} ${orderClause}`;
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
        "SELECT DISTINCT category FROM menu_items ORDER BY category ASC"
      );
      const categories = categoriesResult.rows.map((row) => row.category);

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
