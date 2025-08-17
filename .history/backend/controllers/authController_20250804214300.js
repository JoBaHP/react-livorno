const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, role, username) => {
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
      const token = generateToken(user.id, user.role, user.username);

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Changed from 'strict' to 'lax' for development
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        user: { id: user.id, username: user.username, role: user.role },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getProfile = (req, res) => {
  res.status(200).json({ user: req.user });
};
