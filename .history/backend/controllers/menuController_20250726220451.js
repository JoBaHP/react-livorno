const db = require("../config/db");

exports.getMenu = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM menu_items ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addMenuItem = async (req, res) => {
  const { name, category, description, price, sizes, available } = req.body;
  try {
    const { rows } = await db.query(
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
    res.status(201).json(rows[0]);
  } catch (err) {
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
