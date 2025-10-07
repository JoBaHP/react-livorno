const { Pool } = require("pg");

const DEFAULT_SSL = { rejectUnauthorized: false };

// Determine SSL behavior in a robust, explicit way.
// Priority:
// 1) Respect DB_SSL env if provided ("true"/"false", 1/0, on/off, yes/no)
// 2) If not provided, enable SSL only for non-local hosts when NODE_ENV=production
function resolveSsl() {
  const raw = process.env.DB_SSL;
  if (raw !== undefined) {
    const val = String(raw).trim().toLowerCase();
    if (["1", "true", "on", "yes"].includes(val)) return DEFAULT_SSL;
    if (["0", "false", "off", "no"].includes(val)) return false;
    // Fallback to default behavior if unparsable
  }

  const cs = process.env.DATABASE_URL || "";
  const isLocal = /localhost|127\.0\.0\.1/i.test(cs);
  const isProd = process.env.NODE_ENV === "production";
  return isProd && !isLocal ? DEFAULT_SSL : false;
}

const sslOption = resolveSsl();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslOption
    ? {
        ...DEFAULT_SSL,
        rejectUnauthorized: process.env.DB_SSL_STRICT === "true"
      }
    : false,
});

const testConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log(
      `✅ Successfully connected to PostgreSQL database. SSL=${sslOption ? "enabled" : "disabled"} (NODE_ENV=${
        process.env.NODE_ENV || "development"
      })`
    );
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err.message);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
