const express = require("express");
const authController = require("../controllers/authController");
const tableController = require("../controllers/tableController");
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  "/notifications/subscribe",
  protect,
  notificationController.saveSubscription
);

router.post("/login", authController.login);
router.get("/tables", tableController.getTables);

module.exports = router;
