const db = require("../config/db");

exports.getSalesReport = async (req, res) => {
  const { date } = req.query; // Expecting date in 'YYYY-MM-DD' format

  if (!date) {
    return res.status(400).json({ message: "A date is required." });
  }

  try {
    // This query calculates the total quantity and revenue for each menu item sold on a given day.
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

    // This query calculates the overall daily totals.
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
