const db = require("../config/db");

exports.getSalesReport = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "A date is required." });
  }

  try {
    const itemsQuery = `
            SELECT 
                oi.name, 
                oi.size, 
                SUM(oi.quantity) as total_quantity, 
                SUM(oi.quantity * oi.price) as total_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at::date = $1 AND o.status = 'completed'
            GROUP BY oi.name, oi.size
            ORDER BY total_quantity DESC;
        `;
    const totalsQuery = `
            SELECT 
                COUNT(*) as total_orders, 
                SUM(total) as total_revenue 
            FROM orders 
            WHERE created_at::date = $1 AND status = 'completed';
        `;

    const itemsResult = await db.query(itemsQuery, [date]);
    const totalsResult = await db.query(totalsQuery, [date]);

    res.json({
      reportDate: date,
      itemsSold: itemsResult.rows,
      dailyTotals: totalsResult.rows[0],
    });
  } catch (err) {
    console.error("Error generating sales report:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMonthlySalesReport = async (req, res) => {
  const { month } = req.query; // Expecting month in 'YYYY-MM' format

  if (!month) {
    return res.status(400).json({ message: "A month is required." });
  }

  try {
    const query = `
            SELECT 
                TO_CHAR(created_at::date, 'YYYY-MM-DD') as day,
                SUM(total) as total_revenue
            FROM orders
            WHERE TO_CHAR(created_at, 'YYYY-MM') = $1 AND status = 'completed'
            GROUP BY day
            ORDER BY day ASC;
        `;

    const { rows } = await db.query(query, [month]);
    res.json(rows);
  } catch (err) {
    console.error("Error generating monthly report:", err);
    res.status(500).json({ message: "Server error" });
  }
};
