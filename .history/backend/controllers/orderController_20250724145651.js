// File: backend/controllers/orderController.js
let { orders } = require("../data");
const { getIO } = require("../socket");

exports.getOrders = (req, res) => {
  const { page = 1, limit = 10, startDate, endDate } = req.query;

  let filteredOrders = [...orders];

  // Apply date filtering
  if (startDate) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) >= new Date(startDate)
    );
  }
  if (endDate) {
    // To include the entire end date, we check for dates less than the start of the next day.
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) < end
    );
  }

  // Sort by most recent before paginating
  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Apply pagination
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / limit);
  const startIndex = (page - 1) * limit;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + parseInt(limit)
  );

  res.json({
    orders: paginatedOrders,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalOrders,
    },
  });
};

exports.placeOrder = (req, res) => {
  const { cart, tableId } = req.body;
  const newOrder = {
    id: Date.now(),
    tableId,
    items: cart,
    status: "pending",
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString(),
    waitTime: null,
  };
  orders.push(newOrder);
  getIO().emit("new_order", newOrder);
  res.status(201).json(newOrder);
};

exports.updateOrderStatus = (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { status, waitTime } = req.body;
  let updatedOrder;
  orders = orders.map((order) => {
    if (order.id === orderId) {
      updatedOrder = {
        ...order,
        status,
        waitTime: waitTime !== null ? waitTime : order.waitTime,
      };
      return updatedOrder;
    }
    return order;
  });

  if (updatedOrder) {
    getIO().emit("order_status_update", updatedOrder);
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};
