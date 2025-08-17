const db = require("../config/db");

exports.getAllOptions = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM options ORDER BY price DESC, name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createOption = async (req, res) => {
  const { name, price } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO options (name, price) VALUES ($1, $2) RETURNING *",
      [name, parseFloat(price)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOption = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE options SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, parseFloat(price), id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteOption = async (req, res) => {
  const { id } = req.params;
  try {
    // We also need to remove any links between menu items and this option
    await db.query("DELETE FROM menu_item_options WHERE option_id = $1", [id]);
    await db.query("DELETE FROM options WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
