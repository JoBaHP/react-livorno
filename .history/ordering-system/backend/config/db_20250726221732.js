const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const testConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Successfully connected to PostgreSQL database.");
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err.message);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  testConnection, // Export the new function
};
