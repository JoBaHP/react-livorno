const express = require("express");
const authController = require("../controllers/authController");
const tableController = require("../controllers/tableController");
const optionsController = require("../controllers/optionsController");
const notificationController = require("../controllers/notificationController");
const userController = require("../controllers/userController");
const reportsController = require("../controllers/reportsController");
const deliveryZoneController = require("../controllers/deliveryZoneController");
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const streetsController = require("../controllers/streetsController");

const router = express.Router();

// --- Sales Report Route (Admin Only) ---
router.get("/reports/sales", protect, admin, reportsController.getSalesReport);
router.get(
  "/reports/monthly-sales",
  protect,
  admin,
  reportsController.getMonthlySalesReport
);

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
router.post("/delivery-order", orderController.placeDeliveryOrder);

router.get("/options", protect, admin, optionsController.getAllOptions);
router.post("/options", protect, admin, optionsController.createOption);
router.put("/options/:id", protect, admin, optionsController.updateOption);
router.delete("/options/:id", protect, admin, optionsController.deleteOption);

// --- Admin-Only Delivery Zone Routes ---
router.get("/zones", protect, admin, deliveryZoneController.getAllZones);
router.post("/zones", protect, admin, deliveryZoneController.createZone);
router.put("/zones/:id", protect, admin, deliveryZoneController.updateZone);
router.delete("/zones/:id", protect, admin, deliveryZoneController.deleteZone);

// --- Street Management Routes ---
router.get("/streets", streetsController.getAllStreets);
router.post("/streets", protect, admin, streetsController.createStreet);
router.delete("/streets/:id", protect, admin, streetsController.deleteStreet);
router.post(
  "/streets/populate",
  protect,
  admin,
  streetsController.populateStreetsFromCity
);

module.exports = router;
