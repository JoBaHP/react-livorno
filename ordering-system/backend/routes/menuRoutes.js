const express = require("express");
const menuController = require("../controllers/menuController");
const router = express.Router();

router.get("/", menuController.getMenu);
router.get("/categories", menuController.getMenuCategories);
router.post("/", menuController.addMenuItem);
router.put("/categories/order", menuController.reorderCategories);
router.put("/:id", menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);

module.exports = router;
