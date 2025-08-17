let { orders } = require("../data");
const { getIO } = require("../socket");

exports.getOrders = (req, res) => {
  res.json(
    [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
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
