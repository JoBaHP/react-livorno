const db = require("../config/db");

exports.saveSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { id: userId } = req.user; // From the 'protect' middleware

  try {
    // Avoid duplicate subscriptions
    const existingSub = await db.query(
      "SELECT * FROM push_subscriptions WHERE subscription_object->>'endpoint' = $1 AND user_id = $2",
      [subscription.endpoint, userId]
    );

    if (existingSub.rows.length === 0) {
      await db.query(
        "INSERT INTO push_subscriptions (user_id, subscription_object) VALUES ($1, $2)",
        [userId, subscription]
      );
    }
    res.status(201).json({ message: "Subscription saved." });
  } catch (err) {
    console.error("Error saving subscription:", err);
    res.status(500).json({ message: "Server error" });
  }
};
