const db = require("../config/db");
const { getIO } = require("../socket");

exports.placeOrder = async (req, res) => {
  const { cart, tableId } = req.body;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const client = await db.query("BEGIN");
  try {
    const orderResult = await db.query(
      "INSERT INTO orders (table_id, status, total) VALUES ($1, $2, $3) RETURNING *",
      [tableId, "pending", total]
    );
    const newOrder = orderResult.rows[0];

    for (const item of cart) {
      await db.query(
        "INSERT INTO order_items (order_id, menu_item_id, name, size, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          newOrder.id,
          item.id,
          item.name,
          item.size || null,
          item.quantity,
          item.price,
        ]
      );
    }

    await db.query("COMMIT");

    const finalOrder = { ...newOrder, items: cart };
    getIO().emit("new_order", finalOrder);
    res.status(201).json(finalOrder);
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, waitTime } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE orders SET status = $1, wait_time = $2 WHERE id = $3 RETURNING *",
      [status, waitTime, id]
    );
    const updatedOrder = rows[0];

    const itemsResult = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [updatedOrder.id]
    );
    const finalOrder = { ...updatedOrder, items: itemsResult.rows };

    getIO().emit("order_status_update", finalOrder);
    res.json(finalOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrders = async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate } = req.query;
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let queryParams = [];
  let paramIndex = 1;

  if (startDate) {
    whereClauses.push(`created_at >= $${paramIndex++}`);
    queryParams.push(startDate);
  }
  if (endDate) {
    whereClauses.push(`created_at <= $${paramIndex++}`);
    queryParams.push(endDate + "T23:59:59");
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  try {
    const totalResult = await db.query(
      `SELECT COUNT(*) FROM orders ${whereString}`,
      queryParams
    );
    const totalOrders = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalOrders / limit);

    queryParams.push(limit, offset);
    const ordersResult = await db.query(
      `SELECT * FROM orders ${whereString} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      queryParams
    );

    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await db.query(
          "SELECT * FROM order_items WHERE order_id = $1",
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json({
      orders: ordersWithItems,
      pagination: { currentPage: parseInt(page), totalPages, totalOrders },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
