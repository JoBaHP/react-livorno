const { Pool } = require("pg");

const DEFAULT_SSL = { rejectUnauthorized: false };

// Determine SSL behavior in a robust, explicit way.
// Priority:
// 1) Respect DB_SSL env if provided ("true"/"false", 1/0, on/off, yes/no)
// 2) Respect sslmode=disable/require directives in the connection string
// 3) Enable SSL automatically for any non-local connection string
function resolveSsl() {
  const raw = process.env.DB_SSL;
  if (raw !== undefined) {
    const val = String(raw).trim().toLowerCase();
    if (["1", "true", "on", "yes"].includes(val)) return DEFAULT_SSL;
    if (["0", "false", "off", "no"].includes(val)) return false;
    // Fallback to default behavior if unparsable
  }

  const cs = (process.env.DATABASE_URL || "").trim();
  if (!cs) return false;

  const loweredCs = cs.toLowerCase();
  if (loweredCs.includes("sslmode=disable")) return false;
  if (
    loweredCs.includes("sslmode=require") ||
    loweredCs.includes("sslmode=verify-ca") ||
    loweredCs.includes("sslmode=verify-full")
  ) {
    return DEFAULT_SSL;
  }

  const isLocalHost = (hostname = "") => {
    const lowerHost = hostname.toLowerCase();
    return (
      lowerHost === "localhost" ||
      lowerHost === "127.0.0.1" ||
      lowerHost === "::1" ||
      lowerHost.endsWith(".local")
    );
  };

  try {
    const url = new URL(cs);
    return isLocalHost(url.hostname) ? false : DEFAULT_SSL;
  } catch (err) {
    // Fallback to pattern checks if URL parsing fails (e.g., missing protocol)
    const isLocal = /@(localhost|127\.0\.0\.1|::1)/i.test(cs);
    return isLocal ? false : DEFAULT_SSL;
  }
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
