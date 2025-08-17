const path = require("path");

module.exports = {
  webpack: {
    alias: {
      // This tells the build system where to find your shared folder
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
};
