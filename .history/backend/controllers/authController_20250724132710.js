const { users } = require("../data");

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    res.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
};
