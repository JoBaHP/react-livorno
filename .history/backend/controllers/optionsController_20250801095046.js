const db = require("../config/db");

exports.getAllOptions = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM options ORDER BY name ASC");
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
      [name, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
