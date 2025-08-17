const jwt = require("jsonwebtoken");
const { users } = require("../data");

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
};
