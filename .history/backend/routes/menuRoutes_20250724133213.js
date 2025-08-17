const express = require("express");
const menuController = require("../controllers/menuController");
const router = express.Router();

router.get("/", menuController.getMenu);
router.post("/", menuController.addMenuItem);
router.put("/:id", menuController.updateMenuItem);
router.delete("/:id", menuController.deleteMenuItem);

module.exports = router;
