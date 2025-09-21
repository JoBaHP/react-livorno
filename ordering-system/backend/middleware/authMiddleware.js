const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies.authToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.tokenType !== "access") {
        throw new Error("Invalid token type");
      }
      const { tokenType, iat, exp, ...user } = decoded;
      req.user = user;
      next();
    } catch (error) {
      console.error("TOKEN VERIFICATION FAILED:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
