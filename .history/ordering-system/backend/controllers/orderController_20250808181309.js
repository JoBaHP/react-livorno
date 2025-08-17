const db = require("../config/db");
const { getIO } = require("../socket");

exports.placeOrder = async (req, res) => {
  const { cart, tableId, notes, paymentMethod } = req.body;

  let total = 0;
  cart.forEach((item) => {
    let itemTotal = parseFloat(item.price || 0);
    if (item.selectedOptions) {
      item.selectedOptions.forEach((opt) => {
        itemTotal += parseFloat(opt.price || 0);
      });
    }
    total += itemTotal * item.quantity;
  });

  try {
    await db.query("BEGIN");

    const orderResult = await db.query(
      "INSERT INTO orders (table_id, status, total, notes, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tableId, "pending", total, notes, paymentMethod]
    );
    const newOrder = orderResult.rows[0];

    const orderItemPromises = cart.map((item) => {
      return db.query(
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
    });
    await Promise.all(orderItemPromises);

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

// --- updateOrderStatus: Handles status changes for an order ---
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

// --- Helper function for building the dynamic getOrders query ---
const buildGetOrdersQuery = (queryParams) => {
  const { startDate, endDate, status, sortBy, sortOrder } = queryParams;

  let params = [];
  let whereClauses = [];

  if (startDate) {
    params.push(startDate);
    whereClauses.push(`created_at >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate + "T23:59:59");
    whereClauses.push(`created_at <= $${params.length}`);
  }
  if (status) {
    params.push(status);
    whereClauses.push(`status = $${params.length}`);
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const validSortColumns = [
    "created_at",
    "total",
    "table_id",
    "status",
    "feedback_rating",
  ];
  const orderBy = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  const orderDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  return { whereString, params, orderBy, orderDirection };
};

// --- getOrders: Retrieves a filtered and sorted list of orders ---
exports.getOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { whereString, params, orderBy, orderDirection } =
      buildGetOrdersQuery(req.query);

    const totalResult = await db.query(
      `SELECT COUNT(*) FROM orders ${whereString}`,
      params
    );
    const totalOrders = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalOrders / limit);

    const dataQueryParams = [...params, limit, offset];
    const queryString = `
            SELECT * FROM orders 
            ${whereString} 
            ORDER BY ${orderBy} ${orderDirection} 
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

    const ordersResult = await db.query(queryString, dataQueryParams);

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

// --- submitFeedback: Adds customer feedback to an order ---
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
