const db = require("../config/db");
const jwt = require("jsonwebtoken");

const generateToken = (id, role, username) => {
  // --- FIX ---
  // Read the JWT_SECRET directly here to ensure it's loaded.
  return jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = rows[0];

    if (user && user.password === password) {
      res.json({
        user: { id: user.id, username: user.username, role: user.role },
        token: generateToken(user.id, user.role, user.username),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
