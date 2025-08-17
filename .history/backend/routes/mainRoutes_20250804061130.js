const express = require("express");
const authController = require("../controllers/authController");
const tableController = require("../controllers/tableController");
const optionsController = require("../controllers/optionsController");
const notificationController = require("../controllers/notificationController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// --- Authentication Routes ---
router.post("/login", authController.login);
router.post("/logout", authController.logout); // This route was missing
router.get("/profile", protect, authController.getProfile); // This route checks login status

// --- Other Routes ---
router.get("/tables", tableController.getTables);
router.post(
  "/notifications/subscribe",
  protect,
  notificationController.saveSubscription
);

router.get("/options", protect, admin, optionsController.getAllOptions);
router.post("/options", protect, admin, optionsController.createOption);
router.put("/options/:id", protect, admin, optionsController.updateOption);
router.delete("/options/:id", protect, admin, optionsController.deleteOption);

module.exports = router;
