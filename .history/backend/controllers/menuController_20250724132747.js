let { menu } = require("../data");

exports.getMenu = (req, res) => {
  res.json(menu);
};

exports.addMenuItem = (req, res) => {
  const newItem = { ...req.body, id: Date.now() };
  menu.push(newItem);
  res.status(201).json(newItem);
};

exports.updateMenuItem = (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const updatedItem = req.body;
  menu = menu.map((item) => (item.id === itemId ? updatedItem : item));
  res.json(updatedItem);
};

exports.deleteMenuItem = (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  menu = menu.filter((item) => item.id !== itemId);
  res.status(204).send();
};
