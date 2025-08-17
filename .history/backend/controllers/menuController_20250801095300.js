const db = require("../config/db");

exports.getMenu = async (req, res) => {
  try {
    const menuItemsResult = await db.query(
      "SELECT * FROM menu_items ORDER BY id ASC"
    );
    const menuItems = menuItemsResult.rows;

    const menuWithWithOptions = await Promise.all(
      menuItems.map(async (item) => {
        const optionsResult = await db.query(
          "SELECT o.id, o.name, o.price FROM options o JOIN menu_item_options mo ON o.id = mo.option_id WHERE mo.menu_item_id = $1",
          [item.id]
        );
        return { ...item, options: optionsResult.rows };
      })
    );

    res.json(menuWithWithOptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addMenuItem = async (req, res) => {
  const { name, category, description, price, sizes, available, options } =
    req.body;
  const client = await db.query("BEGIN");
  try {
    const itemResult = await db.query(
      "INSERT INTO menu_items (name, category, description, price, sizes, available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        name,
        category,
        description,
        price || null,
        sizes ? JSON.stringify(sizes) : null,
        available,
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
  const { name, category, description, price, sizes, available } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE menu_items SET name = $1, category = $2, description = $3, price = $4, sizes = $5, available = $6 WHERE id = $7 RETURNING *",
      [
        name,
        category,
        description,
        price || null,
        sizes ? JSON.stringify(sizes) : null,
        available,
        id,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
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
