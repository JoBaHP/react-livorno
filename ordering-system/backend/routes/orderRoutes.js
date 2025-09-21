const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

router.get("/", orderController.getOrders);
router.post("/", orderController.placeOrder);
router.post("/reprice", orderController.repriceOrder);
router.put("/:id", orderController.updateOrderStatus);
router.post("/:id/feedback", orderController.submitFeedback);

module.exports = router;
