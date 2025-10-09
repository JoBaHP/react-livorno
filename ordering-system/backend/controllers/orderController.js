const db = require("../config/db");
const { getIO } = require("../socket");
const jwt = require("jsonwebtoken");
const textBee = require("../services/textbeeClient");

const normaliseOptions = (options = []) =>
  options.map((opt) => {
    const price = parseFloat(opt.price || 0);
    const rawQty = Number(opt.quantity);
    const quantity = Number.isFinite(rawQty)
      ? rawQty
      : price > 0
      ? 1
      : 0;
    return {
      ...opt,
      price,
      quantity,
    };
  });

const calculateLineTotals = (item) => {
  const quantity = Number(item.quantity) || 0;
  const basePrice = parseFloat(item.price || 0);
  const options = normaliseOptions(
    item.selectedOptions || item.selected_options || item.options || []
  );
  const paidOptionsPerUnit = options.reduce((sum, opt) => {
    if (opt.price <= 0 || opt.quantity <= 0) return sum;
    return sum + opt.price * opt.quantity;
  }, 0);
  const lineTotal = (basePrice + paidOptionsPerUnit) * quantity;
  return { basePrice, paidOptionsPerUnit, lineTotal, options, quantity };
};

const getSessionUser = (req) => {
  const token = req.cookies?.authToken;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const restaurantName = process.env.RESTAURANT_NAME || "Livorno Ristorante";
const restaurantAddress =
  process.env.RESTAURANT_ADDRESS || process.env.RESTAURANT_LOCATION || "";
const restaurantLocale = process.env.RESTAURANT_LOCALE || "en-US";
const restaurantCurrency = process.env.RESTAURANT_CURRENCY || "EUR";

const formatCurrency = (value) => {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return String(value ?? "");
  try {
    return new Intl.NumberFormat(restaurantLocale, {
      style: "currency",
      currency: restaurantCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    return amount.toFixed(2);
  }
};

const buildDeliveryAcceptanceMessage = (order, waitTimeMinutes) => {
  if (!order) return null;
  const lines = [`${restaurantName} delivery accepted`];
  if (restaurantAddress) {
    lines.push(`Pickup: ${restaurantAddress}`);
  }
  if (order.total !== undefined && order.total !== null) {
    lines.push(`Bill: ${formatCurrency(order.total)}`);
  }

  const waitMinutes = Number.isFinite(waitTimeMinutes)
    ? Math.max(waitTimeMinutes, 0)
    : null;
  let etaLine = "Ready soon";
  if (waitMinutes !== null) {
    const etaDate = new Date(Date.now() + waitMinutes * 60 * 1000);
    const etaTime = etaDate.toLocaleTimeString(restaurantLocale, {
      hour: "2-digit",
      minute: "2-digit",
    });
    etaLine = `Ready in ~${waitMinutes} min (≈ ${etaTime})`;
  }
  lines.push(`Order #${order.id} · ${etaLine}`);
  if (order.customer_name) {
    lines.push(`Customer: ${order.customer_name}`);
  }
  if (order.customer_phone) {
    lines.push(`Phone: ${order.customer_phone}`);
  }
  if (order.customer_address) {
    lines.push(`Address: ${order.customer_address}`);
  }
  return lines.join("\n");
};

// --- placeOrder: Handles creating a new TABLE order ---
exports.placeOrder = async (req, res) => {
  const { cart, tableId, notes, paymentMethod } = req.body;
  let total = 0;
  cart.forEach((item) => {
    const basePrice = parseFloat(item.price || 0);
    let optionsPerUnit = 0;
    if (item.selectedOptions) {
      item.selectedOptions.forEach((opt) => {
        const price = parseFloat(opt.price || 0);
        if (price <= 0) return;
        const rawQty = Number(opt.quantity);
        const quantity = Number.isFinite(rawQty) ? rawQty : 1;
        if (quantity <= 0) return;
        optionsPerUnit += price * quantity;
      });
    }
    const itemQuantity = item.quantity || 0;
    total += (basePrice + optionsPerUnit) * itemQuantity;
  });

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (table_id, status, total, notes, payment_method, order_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [tableId, "pending", total, notes, paymentMethod, "table"]
    );
    const newOrder = orderResult.rows[0];

    const orderItemPromises = cart.map((item) => {
      return client.query(
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

    await client.query("COMMIT");

    const finalOrder = { ...newOrder, items: cart };
    getIO().emit("new_order", finalOrder);
    res.status(201).json(finalOrder);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// --- placeDeliveryOrder: Handles creating a new DELIVERY order ---
exports.placeDeliveryOrder = async (req, res) => {
  // --- FIX ---
  // Destructure the customer details directly from the request body,
  // as this is the format the frontend is sending.
  const {
    cart,
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    notes,
    customerEmail,
    customerExternalId,
    customerAvatar,
  } = req.body;

  // The geocoding service only needs the main address, not floor/apartment details.
  const geocodingAddress = `${customerAddress.split(",")[0]}, ${
    process.env.RESTAURANT_LOCATION
  }`;

  const sessionUser = getSessionUser(req);
  const externalId = customerExternalId || sessionUser?.id || null;
  const email = customerEmail || sessionUser?.email || null;
  const avatar = customerAvatar || sessionUser?.picture || null;
  const displayName = customerName || sessionUser?.name || sessionUser?.username || customerName;

  let location;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        geocodingAddress
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
    console.error("Geocoding error:", err);
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
    if (db.isConnectionError && db.isConnectionError(err)) {
      console.error("Zone finding error (database unavailable):", err.message);
      return res.status(503).json({
        message: "Delivery calculator is temporarily unavailable. Please try again shortly.",
      });
    }
    console.error("Zone finding error:", err);
    return res.status(500).json({ message: "Error calculating delivery fee." });
  }

  let total = deliveryFee;
  cart.forEach((item) => {
    const { lineTotal } = calculateLineTotals(item);
    total += lineTotal;
  });

  let client;
  try {
    client = await db.pool.connect();
  } catch (connErr) {
    if (db.isConnectionError && db.isConnectionError(connErr)) {
      console.error("Order placement error (connect):", connErr.message);
      return res.status(503).json({
        message: "Database connection is unavailable. Please try again in a moment.",
      });
    }
    console.error("Order placement error (connect):", connErr);
    return res.status(500).json({ message: "Server error while placing order." });
  }

  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (table_id, status, total, notes, payment_method, order_type, customer_name, customer_phone, customer_address, customer_email, customer_external_id, customer_avatar, delivery_fee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        null,
        "pending",
        total,
        notes,
        paymentMethod,
        "delivery",
        displayName,
        customerPhone,
        customerAddress,
        email,
        externalId,
        avatar,
        deliveryFee,
      ]
    );
    const newOrder = orderResult.rows[0];

    for (const item of cart) {
      const normalised = {
        ...item,
        selectedOptions: normaliseOptions(item.selectedOptions),
      };
      await client.query(
        "INSERT INTO order_items (order_id, menu_item_id, name, size, quantity, price, selected_options) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          newOrder.id,
          item.id,
          item.name,
          item.size || null,
          item.quantity,
          item.price,
          normalised.selectedOptions.length
            ? JSON.stringify(normalised.selectedOptions)
            : null,
        ]
      );
    }

    await client.query("COMMIT");

    const finalOrder = { ...newOrder, delivery_fee: deliveryFee, items: cart };
    getIO().emit("new_order", finalOrder);
    res.status(201).json(finalOrder);
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Order rollback failed:", rollbackErr);
    }
    if (db.isConnectionError && db.isConnectionError(err)) {
      console.error("Order placement error (database unavailable):", err.message);
      return res.status(503).json({
        message: "Database connection interrupted while placing order. Please try again shortly.",
      });
    }
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Server error while placing order." });
  } finally {
    if (client) {
      client.release();
    }
  }
};

exports.repriceOrder = async (req, res) => {
  try {
    const { items = [] } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const normalised = items.map((item) => ({
      ...item,
      selected_options: normaliseOptions(
        item.selectedOptions || item.selected_options || item.options || []
      ),
    }));

    const withTotals = normalised.map((item) => ({
      ...item,
      ...calculateLineTotals(item),
    }));

    const total = withTotals.reduce((sum, entry) => sum + entry.lineTotal, 0);

    res.json({
      items: withTotals.map(({ selected_options, ...rest }) => ({
        ...rest,
        selected_options,
        selectedOptions: selected_options,
      })),
      total,
    });
  } catch (err) {
    console.error("Error repricing order:", err);
    res.status(500).json({ message: "Failed to reprice order" });
  }
};

// --- updateOrderStatus: Handles status changes for an order ---
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, waitTime } = req.body;
  const parsedWait =
    waitTime === undefined || waitTime === null || waitTime === ''
      ? null
      : Number.parseInt(waitTime, 10);
  const waitTimeValue = Number.isFinite(parsedWait) ? parsedWait : null;
  try {
    const { rows } = await db.query(
      "UPDATE orders SET status = $1, wait_time = COALESCE($2, wait_time) WHERE id = $3 RETURNING *",
      [status, waitTimeValue, id]
    );
    const updatedOrder = rows[0];

    const itemsResult = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [updatedOrder.id]
    );
    const finalOrder = { ...updatedOrder, items: itemsResult.rows };

    if (
      status === "accepted" &&
      finalOrder.order_type === "delivery" &&
      textBee.isConfigured()
    ) {
      const fallbackWait = Number.isFinite(Number(finalOrder.wait_time))
        ? Number.parseInt(finalOrder.wait_time, 10)
        : null;
      const waitMinutes = waitTimeValue ?? fallbackWait;
      const message = buildDeliveryAcceptanceMessage(finalOrder, waitMinutes);
      if (message) {
        try {
          await textBee.broadcastMessage(message);
        } catch (smsErr) {
          console.error("Failed to queue TextBee delivery alert:", smsErr);
        }
      }
    }

    getIO().emit("order_status_update", finalOrder);
    res.json(finalOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- getOrders: Retrieves a filtered and sorted list of orders ---
exports.getOrders = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    status,
    orderType,
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
  if (orderType) {
    queryParams.push(orderType);
    whereClauses.push(`order_type = $${queryParams.length}`);
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
    const queryString = `
            SELECT * FROM orders 
            ${whereString} 
            ORDER BY ${orderBy} ${orderDirection} 
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
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

exports.getOrdersForUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json({ orders: [], frequentItems: [] });
    }

    const clauses = [];
    const params = [];
    if (user.id) {
      params.push(user.id);
      clauses.push(`customer_external_id = $${params.length}`);
    }
    if (user.email) {
      params.push(user.email);
      clauses.push(`customer_email = $${params.length}`);
    }

    if (!clauses.length) {
      return res.json({ orders: [], frequentItems: [] });
    }

    const whereClause = clauses.length > 1 ? `(${clauses.join(" OR ")})` : clauses[0];
    const ordersQuery = `
      SELECT id, status, total, notes, payment_method, order_type,
             customer_name, customer_phone, customer_address,
             customer_email, customer_external_id, customer_avatar,
             created_at
      FROM orders
      WHERE ${whereClause}
        AND order_type = 'delivery'
      ORDER BY created_at DESC
      LIMIT 25
    `;

    const { rows: orders } = await db.query(ordersQuery, params);
    if (!orders.length) {
      return res.json({ orders: [], frequentItems: [] });
    }

    const orderIds = orders.map((order) => order.id);
    const { rows: orderItems } = await db.query(
      `SELECT id, order_id, menu_item_id, name, size, quantity, price, selected_options
       FROM order_items
       WHERE order_id = ANY($1::int[])
       ORDER BY id ASC`,
      [orderIds]
    );

    const itemsByOrder = new Map();
    for (const item of orderItems) {
      const list = itemsByOrder.get(item.order_id) || [];
      let rawOptions;
      if (Array.isArray(item.selected_options)) {
        rawOptions = item.selected_options;
      } else if (typeof item.selected_options === "string") {
        try {
          rawOptions = JSON.parse(item.selected_options);
        } catch (err) {
          rawOptions = [];
        }
      } else if (item.selected_options && typeof item.selected_options === "object") {
        rawOptions = item.selected_options;
      } else {
        rawOptions = [];
      }
      const normalizedOptions = Array.isArray(rawOptions)
        ? rawOptions.map((opt) => ({
            ...opt,
            price: typeof opt.price === "number" ? opt.price : Number(opt.price) || 0,
            quantity: typeof opt.quantity === "number" ? opt.quantity : Number(opt.quantity) || 0,
          }))
        : [];
      list.push({
        ...item,
        price:
          typeof item.price === "number" ? item.price : Number(item.price) || 0,
        quantity:
          typeof item.quantity === "number" ? item.quantity : Number(item.quantity) || 1,
        menu_item_id:
          typeof item.menu_item_id === "number"
            ? item.menu_item_id
            : item.menu_item_id
            ? Number(item.menu_item_id) || null
            : null,
        selected_options: normalizedOptions,
      });
      itemsByOrder.set(item.order_id, list);
    }

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(order.id) || [],
    }));

    const favoritesMap = new Map();
    for (const order of ordersWithItems) {
      for (const item of order.items) {
        const options = Array.isArray(item.selected_options)
          ? item.selected_options
          : [];
        const normalizedOptions = options
          .map((opt) => ({
            id: opt.id ?? opt.option_id ?? opt.menu_option_id ?? opt.slug ?? opt.name,
            name: opt.name,
            price:
              typeof opt.price === "number" ? opt.price : Number(opt.price) || 0,
            quantity:
              typeof opt.quantity === "number" ? opt.quantity : Number(opt.quantity) || 1,
          }))
          .sort((a, b) => (a.id || "").localeCompare(b.id || ""));

        const key = `${item.menu_item_id || item.name}::${item.size || ""}::${JSON.stringify(normalizedOptions)}`;
        const quantity = Number(item.quantity) || 1;
        if (!favoritesMap.has(key)) {
          favoritesMap.set(key, {
            menuItemId: item.menu_item_id,
            name: item.name,
            size: item.size || null,
            price: item.price,
            selectedOptions: normalizedOptions,
            totalQuantity: 0,
            lastOrderedAt: order.created_at,
            quantity,
          });
        }
        const entry = favoritesMap.get(key);
        entry.totalQuantity += quantity;
        entry.quantity = quantity || entry.quantity || 1;
        if (order.created_at && new Date(order.created_at) > new Date(entry.lastOrderedAt)) {
          entry.lastOrderedAt = order.created_at;
        }
      }
    }

    const frequentItems = Array.from(favoritesMap.values())
      .sort((a, b) => {
        if (b.totalQuantity !== a.totalQuantity) {
          return b.totalQuantity - a.totalQuantity;
        }
        return new Date(b.lastOrderedAt) - new Date(a.lastOrderedAt);
      })
      .slice(0, 5);

    res.json({ orders: ordersWithItems, frequentItems });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};
