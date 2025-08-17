const { tables } = require("../data");

exports.getTables = (req, res) => {
  res.json(tables);
};
