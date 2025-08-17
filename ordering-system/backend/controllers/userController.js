const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, username, role FROM users ORDER BY username ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username, hashedPassword, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error or username already exists" });
  }
};

exports.updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
