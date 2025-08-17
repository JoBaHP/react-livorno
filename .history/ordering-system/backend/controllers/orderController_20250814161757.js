const db = require("../config/db");
const { getIO } = require("../socket");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- placeOrder: Handles creating a new TABLE order ---
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
      "INSERT INTO orders (table_id, status, total, notes, payment_method, order_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [tableId, "pending", total, notes, paymentMethod, "table"]
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

// --- placeDeliveryOrder: Handles creating a new DELIVERY order ---
exports.placeDeliveryOrder = async (req, res) => {
  const {
    cart,
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    notes,
  } = req.body;

  let location;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        customerAddress
      )}`,
      {
        headers: {
          "User-Agent": "LivornoRistorante/1.0 (contact@livornoristorante.com)",
        },
      }
    );
    const data = await response.json();
    if (!data || data.length === 0) {
      return res.status(400).json({
        message: "Could not find the address. Please check and try again.",
      });
    }
    location = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (err) {
    return res.status(500).json({ message: "Error validating address." });
  }

  let deliveryFee = 0;
  try {
    const { rows } = await db.query(
      `
            SELECT delivery_fee FROM delivery_zones
            WHERE (6371 * 2 * ASIN(SQRT(POWER(SIN((center_lat - $1) * pi()/180 / 2), 2) + COS(center_lat * pi()/180) * COS($1 * pi()/180) * POWER(SIN((center_lng - $2) * pi()/180 / 2), 2))) * 1000) <= radius_meters
            ORDER BY delivery_fee ASC LIMIT 1;
        `,
      [location.lat, location.lng]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Sorry, your address is outside our delivery area." });
    }
    deliveryFee = parseFloat(rows[0].delivery_fee);
  } catch (err) {
    return res.status(500).json({ message: "Error calculating delivery fee." });
  }

  let total = deliveryFee;
  cart.forEach((item) => {
    let itemTotal = parseFloat(item.price || 0);
    if (item.selectedOptions) {
      item.selectedOptions.forEach((opt) => {
        itemTotal += parseFloat(opt.price || 0);
      });
    }
    total += itemTotal * item.quantity;
  });

  const client = await db.pool.connect(); // Get a client from the pool
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (table_id, status, total, notes, payment_method, order_type, customer_name, customer_phone, customer_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        null,
        "pending",
        total,
        notes,
        paymentMethod,
        "delivery",
        customerName,
        customerPhone,
        customerAddress,
      ]
    );
    const newOrder = orderResult.rows[0];

    for (const item of cart) {
      await client.query(
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

    await client.query("COMMIT");

    const finalOrder = { ...newOrder, items: cart };
    getIO().emit("new_order", finalOrder);
    res.status(201).json(finalOrder);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Server error while placing order." });
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// --- (updateOrderStatus, getOrders, and submitFeedback are the same) ---
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
    status,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = req.query;
  const offset = (page - 1) * limit;
  let queryParams = [];
  let whereClauses = [];
  if (startDate) {
    queryParams.push(startDate);
    whereClauses.push(`created_at >= $${queryParams.length}`);
  }
  if (endDate) {
    queryParams.push(endDate + "T23:59:59");
    whereClauses.push(`created_at <= $${queryParams.length}`);
  }
  if (status) {
    queryParams.push(status);
    whereClauses.push(`status = $${queryParams.length}`);
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
  try {
    const totalResult = await db.query(
      `SELECT COUNT(*) FROM orders ${whereString}`,
      queryParams
    );
    const totalOrders = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalOrders / limit);
    const dataQueryParams = [...queryParams, limit, offset];
    const queryString = `SELECT * FROM orders ${whereString} ORDER BY ${orderBy} ${orderDirection} LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;
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
