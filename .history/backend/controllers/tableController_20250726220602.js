const db = require("../config/db");

exports.getTables = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM tables ORDER BY number ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
