const db = require("../config/db");
const { menu: seedMenuData } = require("../data");

const FALLBACK_PARENT_KEY = "food";

let cachedMenuItems = null;
let cachedCategories = null;
const MENU_CACHE_REFRESH_INTERVAL_MS = 60 * 1000;
let lastMenuCacheRefresh = 0;
let menuCacheRefreshPromise = null;

function cloneMenuItems(sourceItems) {
  if (!Array.isArray(sourceItems)) return [];
  return sourceItems.map((item) => {
    const sizes = Array.isArray(item.sizes)
      ? item.sizes.map((size) => ({
          name: size.name,
          price: size.price,
        }))
      : null;
    const options = Array.isArray(item.options)
      ? item.options.map((opt) => ({
          ...opt,
          price: opt.price,
        }))
      : [];
    const category =
      Object.prototype.hasOwnProperty.call(item, "category") &&
      item.category !== undefined
        ? item.category
        : null;
    const sortOrderRaw = Object.prototype.hasOwnProperty.call(item, "sort_order")
      ? item.sort_order
      : Object.prototype.hasOwnProperty.call(item, "sortOrder")
      ? item.sortOrder
      : null;
    const sortOrder =
      typeof sortOrderRaw === "number"
        ? sortOrderRaw
        : typeof sortOrderRaw === "string" && sortOrderRaw !== ""
        ? Number.parseInt(sortOrderRaw, 10)
        : null;
    const imageUrl = item.image_url || item.imageUrl || null;
    const available =
      typeof item.available === "boolean" ? item.available : true;

    return {
      id: item.id,
      name: item.name,
      category,
      description:
        Object.prototype.hasOwnProperty.call(item, "description") &&
        item.description !== undefined
          ? item.description
          : null,
      price:
        Object.prototype.hasOwnProperty.call(item, "price") &&
        item.price !== undefined
          ? item.price
          : null,
      sizes,
      available,
      image_url: imageUrl,
      options,
      sort_order: sortOrder,
    };
  });
}

function cloneCategories(sourceCategories) {
  if (!Array.isArray(sourceCategories)) return [];
  return sourceCategories
    .map((cat, index) => ({
      name:
        Object.prototype.hasOwnProperty.call(cat, "name") &&
        cat.name !== undefined
          ? cat.name
          : null,
      sortOrder:
        typeof cat.sortOrder === "number"
          ? cat.sortOrder
          : typeof cat.sort_order === "number"
          ? cat.sort_order
          : typeof cat.sort_order === "string" && cat.sort_order !== ""
          ? Number.parseInt(cat.sort_order, 10)
          : index,
      parentKey: cat.parentKey || cat.parent_key || FALLBACK_PARENT_KEY,
    }))
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      const nameA = a.name ?? "";
      const nameB = b.name ?? "";
      return nameA.localeCompare(nameB);
    });
}

function buildCategoriesFromMenuItems(menuItems) {
  if (!Array.isArray(menuItems)) return [];
  const unique = new Map();
  menuItems.forEach((item) => {
    const category =
      Object.prototype.hasOwnProperty.call(item, "category") &&
      item.category !== undefined
        ? item.category
        : null;
    const key = category ?? "__null__";
    if (!unique.has(key)) {
      unique.set(key, category ?? null);
    }
  });
  return Array.from(unique.values())
    .sort((a, b) => {
      if (a === null && b !== null) return 1;
      if (b === null && a !== null) return -1;
      if (a === null && b === null) return 0;
      return String(a).localeCompare(String(b));
    })
    .map((name, index) => ({
      name,
      sortOrder: index,
      parentKey: FALLBACK_PARENT_KEY,
    }));
}

function deriveCategories(categoriesSource, menuItems) {
  const cloned = cloneCategories(categoriesSource);
  if (cloned.length > 0) {
    return cloned;
  }
  return buildCategoriesFromMenuItems(menuItems);
}

function buildCategoryOrderMap(categories) {
  const map = new Map();
  categories.forEach((cat) => {
    const key = cat.name ?? "__null__";
    map.set(key, cat.sortOrder);
  });
  return map;
}

function sortMenuItems(items, sortDir, orderMap) {
  const sorted = items.slice().sort((a, b) => {
    const keyA = a.category ?? "__null__";
    const keyB = b.category ?? "__null__";
    const orderA = orderMap.has(keyA)
      ? orderMap.get(keyA)
      : Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.has(keyB)
      ? orderMap.get(keyB)
      : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB);
  });
  return sortDir === "DESC" ? sorted.reverse() : sorted;
}

function buildMenuResponseFromSource({
  itemsSource,
  categoriesSource,
  isPaged,
  page,
  limit,
  sortDir,
  categoryFilter,
}) {
  const items = cloneMenuItems(itemsSource);
  const categories = deriveCategories(categoriesSource, items);
  const orderMap = buildCategoryOrderMap(categories);
  let filtered = items;
  if (categoryFilter) {
    if (categoryFilter === "__null__") {
      filtered = items.filter((item) => item.category == null);
    } else {
      filtered = items.filter((item) => item.category === categoryFilter);
    }
  }
  const sorted = sortMenuItems(filtered, sortDir, orderMap);
  if (!isPaged) {
    return sorted;
  }
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const itemsPage = sorted.slice(offset, offset + limit);
  return {
    items: itemsPage,
    page,
    total,
    totalPages,
    limit,
    categories,
  };
}

function updateMenuCache(items) {
  cachedMenuItems = cloneMenuItems(items);
}

function updateCategoriesCache(categories) {
  cachedCategories = cloneCategories(categories);
}

async function refreshMenuCache(force = false) {
  const now = Date.now();
  const hasCache =
    Array.isArray(cachedMenuItems) && cachedMenuItems.length > 0;
  if (!force && hasCache && now - lastMenuCacheRefresh < MENU_CACHE_REFRESH_INTERVAL_MS) {
    return cachedMenuItems;
  }
  if (menuCacheRefreshPromise) {
    return menuCacheRefreshPromise;
  }

  menuCacheRefreshPromise = (async () => {
    const menuItemsResult = await db.query(
      `SELECT menu_items.*, mc.sort_order
       FROM menu_items
       LEFT JOIN menu_categories mc ON menu_items.category = mc.name
       ORDER BY menu_items.id ASC`
    );
    const allItems = menuItemsResult.rows;

    const optionsResult = await db.query(
      `SELECT mo.menu_item_id, o.id, o.name, o.price
       FROM menu_item_options mo
       JOIN options o ON o.id = mo.option_id`
    );
    const optionsByItem = new Map();
    optionsResult.rows.forEach((row) => {
      if (!optionsByItem.has(row.menu_item_id)) {
        optionsByItem.set(row.menu_item_id, []);
      }
      optionsByItem.get(row.menu_item_id).push({
        id: row.id,
        name: row.name,
        price: row.price,
      });
    });

    const itemsWithOptions = allItems.map((item) => ({
      ...item,
      options: optionsByItem.get(item.id) || [],
    }));
    updateMenuCache(itemsWithOptions);

    try {
      const categoriesResult = await db.query(
        "SELECT name, sort_order, parent_key FROM menu_categories ORDER BY sort_order ASC, name ASC"
      );
      const categories = categoriesResult.rows.map((row) => ({
        name: row.name,
        sortOrder: row.sort_order,
        parentKey: row.parent_key,
      }));
      const uncategorizedResult = await db.query(
        "SELECT EXISTS (SELECT 1 FROM menu_items WHERE category IS NULL) AS has_uncategorized"
      );
      if (uncategorizedResult.rows[0]?.has_uncategorized) {
        categories.push({
          name: null,
          sortOrder: null,
          parentKey: FALLBACK_PARENT_KEY,
        });
      }
      updateCategoriesCache(categories);
    } catch (catError) {
      console.warn(
        "Unable to refresh menu categories cache:",
        catError.message
      );
    }

    lastMenuCacheRefresh = Date.now();
    return cachedMenuItems;
  })().finally(() => {
    menuCacheRefreshPromise = null;
  });

  return menuCacheRefreshPromise;
}

function getCategoriesFallbackPayload() {
  if (Array.isArray(cachedCategories) && cachedCategories.length > 0) {
    return cachedCategories.map((cat) => ({ ...cat }));
  }
  const itemsSource =
    Array.isArray(cachedMenuItems) && cachedMenuItems.length > 0
      ? cachedMenuItems
      : seedMenuData;
  return deriveCategories(null, cloneMenuItems(itemsSource));
}

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
  const mode = req.query.mode || "";
  const isPaged =
    mode === "admin" || Boolean(req.query.page) || Boolean(req.query.limit);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(req.query.limit, 10) || 10)
  );
  const rawSort = (req.query.sort || "asc").toLowerCase();
  const sortDir = rawSort === "desc" ? "DESC" : "ASC";
  const categoryFilter = req.query.category;
  try {
    await syncCategoriesFromMenuItems();
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
      updateCategoriesCache(categories);
      refreshMenuCache().catch((err) => {
        console.warn("Background menu cache refresh failed:", err.message);
      });

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

    updateMenuCache(menuWithOptions);

    return res.json(menuWithOptions);
  } catch (err) {
    if (typeof db.isConnectionError === "function" && db.isConnectionError(err)) {
      console.warn(
        "Serving fallback menu data due to database connectivity issue:",
        err.message
      );
      const fallbackPayload = buildMenuResponseFromSource({
        itemsSource:
          Array.isArray(cachedMenuItems) && cachedMenuItems.length > 0
            ? cachedMenuItems
            : seedMenuData,
        categoriesSource: cachedCategories,
        isPaged,
        page,
        limit,
        sortDir,
        categoryFilter,
      });
      return res.json(fallbackPayload);
    }
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
    updateCategoriesCache(categories);
    res.json({ categories });
  } catch (err) {
    if (typeof db.isConnectionError === "function" && db.isConnectionError(err)) {
      console.warn(
        "Serving fallback menu categories due to database connectivity issue:",
        err.message
      );
      return res.json({ categories: getCategoriesFallbackPayload() });
    }
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
    try {
      await refreshMenuCache(true);
    } catch (cacheError) {
      console.warn(
        "Menu cache refresh after addMenuItem failed:",
        cacheError.message
      );
    }
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
    try {
      await refreshMenuCache(true);
    } catch (cacheError) {
      console.warn(
        "Menu cache refresh after updateMenuItem failed:",
        cacheError.message
      );
    }
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
    try {
      await refreshMenuCache(true);
    } catch (cacheError) {
      console.warn(
        "Menu cache refresh after deleteMenuItem failed:",
        cacheError.message
      );
    }
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
    try {
      await refreshMenuCache(true);
    } catch (cacheError) {
      console.warn(
        "Menu cache refresh after reorderCategories failed:",
        cacheError.message
      );
    }

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

exports.primeMenuCache = refreshMenuCache;
