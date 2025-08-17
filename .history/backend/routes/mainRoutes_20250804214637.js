const express = require("express");
const authController = require("../controllers/authController");
const tableController = require("../controllers/tableController");
const optionsController = require("../controllers/optionsController");
const notificationController = require("../controllers/notificationController");
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// --- Authentication Routes ---
router.post("/login", authController.login);
router.post("/logout", authController.logout); // This route was missing
router.get("/profile", protect, authController.getProfile); // This route checks login status

// --- User Management Routes (Admin Only) ---
router.get("/users", protect, admin, userController.getAllUsers);
router.post("/users", protect, admin, userController.createUser);
router.put(
  "/users/:id/password",
  protect,
  admin,
  userController.updateUserPassword
);
router.delete("/users/:id", protect, admin, userController.deleteUser);

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
