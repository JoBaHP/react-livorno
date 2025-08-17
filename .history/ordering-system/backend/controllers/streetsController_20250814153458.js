const db = require("../config/db");

exports.getAllStreets = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM streets ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createStreet = async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO streets (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteStreet = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM streets WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
