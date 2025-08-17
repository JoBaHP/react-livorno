const path = require("path");

module.exports = {
  webpack: {
    alias: {
      // This creates a shortcut '@shared' that points to your shared folder
      "@shared": path.resolve(__dirname, "/shared"),
    },
  },
};
