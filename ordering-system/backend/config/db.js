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
  max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: Number.parseInt(
    process.env.DB_IDLE_TIMEOUT_MS || "60000",
    10
  ),
  connectionTimeoutMillis: Number.parseInt(
    process.env.DB_CONNECTION_TIMEOUT_MS || "20000",
    10
  ),
  statement_timeout: Number.parseInt(
    process.env.DB_STATEMENT_TIMEOUT_MS || "45000",
    10
  ),
  query_timeout: Number.parseInt(
    process.env.DB_QUERY_TIMEOUT_MS || "45000",
    10
  ),
  keepAlive: true,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const RETRIABLE_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ECONNABORTED",
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
]);

const RETRIABLE_MESSAGE_SUBSTRINGS = [
  "connection terminated unexpectedly",
  "connection terminated due to connection timeout",
  "terminating connection due to administrator command",
  "server closed the connection unexpectedly",
  "terminating connection because protocol synchronization was lost",
  "remaining connection slots are reserved",
  "too many clients already",
  "pool is draining and cannot accept work",
  "socket hang up",
];

const MAX_RETRIES = Math.max(
  1,
  Number.parseInt(process.env.DB_QUERY_MAX_RETRIES || "5", 10)
);
const BASE_DELAY_MS = Math.max(
  50,
  Number.parseInt(process.env.DB_QUERY_RETRY_DELAY_MS || "250", 10)
);
const MAX_DELAY_MS = Math.max(
  BASE_DELAY_MS,
  Number.parseInt(process.env.DB_QUERY_MAX_DELAY_MS || "2000", 10)
);

const collectErrors = (error, callback, seen = new Set()) => {
  if (!error || seen.has(error)) return;
  seen.add(error);
  callback(error);
  if (Array.isArray(error.errors)) {
    error.errors.forEach((inner) => collectErrors(inner, callback, seen));
  }
  if (error.cause && typeof error.cause === "object") {
    collectErrors(error.cause, callback, seen);
  }
};

const gatherErrorCodes = (error) => {
  const codes = [];
  collectErrors(error, (err) => {
    if (err && err.code) {
      codes.push(err.code);
    }
  });
  return codes;
};

const gatherErrorMessages = (error) => {
  const messages = [];
  collectErrors(error, (err) => {
    if (err && err.message) {
      messages.push(String(err.message).toLowerCase());
    }
  });
  return messages;
};

const isRetriableError = (error) => {
  const codes = gatherErrorCodes(error);
  if (codes.some((code) => RETRIABLE_ERROR_CODES.has(code))) {
    return true;
  }
  const messages = gatherErrorMessages(error);
  return messages.some((msg) =>
    RETRIABLE_MESSAGE_SUBSTRINGS.some((needle) => msg.includes(needle))
  );
};

const queryWithRetry = async (text, params) => {
  let attempt = 0;
  let lastError = null;
  while (attempt < MAX_RETRIES) {
    attempt += 1;
    try {
      return await pool.query(text, params);
    } catch (error) {
      lastError = error;
      if (!isRetriableError(error) || attempt >= MAX_RETRIES) {
        throw error;
      }
      const delay = Math.min(
        BASE_DELAY_MS * 2 ** (attempt - 1),
        MAX_DELAY_MS
      );
      console.warn(
        `[db] Query attempt ${attempt} failed (${error.code || error.message}), retrying in ${delay}ms`
      );
      await sleep(delay);
    }
  }
  throw lastError;
};

const testConnection = async () => {
  try {
    await queryWithRetry("SELECT NOW()");
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
  query: (text, params) => queryWithRetry(text, params),
  pool,
  testConnection,
  isConnectionError: (error) => isRetriableError(error),
};
