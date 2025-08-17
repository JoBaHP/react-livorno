const express = require("express");
const authController = require("../controllers/authController");
const tableController = require("../controllers/tableController");
const optionsController = require("../controllers/optionsController");
const notificationController = require("../controllers/notificationController");
const { protect, admin } = require("../middleware/authMiddleware"); // Make sure middleware is imported
const router = express.Router();

router.post("/login", authController.login);
router.get("/tables", tableController.getTables);
router.post(
  "/notifications/subscribe",
  protect,
  notificationController.saveSubscription
);

router.get("/options", protect, optionsController.getAllOptions);
router.post("/options", protect, optionsController.createOption);

module.exports = router;
