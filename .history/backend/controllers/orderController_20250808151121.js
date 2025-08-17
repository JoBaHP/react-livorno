const db = require("../config/db");
const { getIO } = require("../socket");
const webpush = require("../config/push");

exports.placeOrder = async (req, res) => {
  const { cart, tableId, notes, paymentMethod } = req.body;
  let total = 0;
  cart.forEach((item) => {
    total += parseFloat(item.price) * item.quantity;
    if (item.selectedOptions) {
      item.selectedOptions.forEach((opt) => {
        if (opt.price > 0) {
          total += parseFloat(opt.price) * item.quantity;
        }
      });
    }
  });

  const client = await db.query("BEGIN");
  try {
    const orderResult = await db.query(
      "INSERT INTO orders (table_id, status, total, notes, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tableId, "pending", total, notes, paymentMethod]
    );
    const newOrder = orderResult.rows[0];

    for (const item of cart) {
      await db.query(
        "INSERT INTO order_items (order_id, menu_item_id, name, size, quantity, price, selected_options) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          newOrder.id,
          item.id,
          item.name,
          item.size || null,
          item.quantity,
          item.price,
          item.selectedOptions ? JSON.stringify(item.selectedOptions) : null,
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
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    tableId,
    orderId,
    status,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = req.query;
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
  if (tableId) {
    whereClauses.push(`table_id = $${paramIndex++}`);
    queryParams.push(tableId);
  }
  if (orderId) {
    whereClauses.push(`id = $${paramIndex++}`);
    queryParams.push(orderId);
  }
  if (status) {
    whereClauses.push(`status = $${paramIndex++}`);
    queryParams.push(status);
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Whitelist columns that can be sorted to prevent SQL injection
  const validSortColumns = ["created_at", "total"];
  const orderBy = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  const orderDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    const totalResult = await db.query(
      `SELECT COUNT(*) FROM orders ${whereString}`,
      queryParams
    );
    const totalOrders = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalOrders / limit);

    queryParams.push(limit, offset);
    const ordersResult = await db.query(
      `SELECT * FROM orders ${whereString} ORDER BY ${orderBy} ${orderDirection} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
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

exports.submitFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE orders SET feedback_rating = $1, feedback_comment = $2 WHERE id = $3 RETURNING *",
      [rating, comment, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};
