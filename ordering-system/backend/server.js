const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { initSocket } = require("./socket");
const { testConnection } = require("./config/db");
const { primeMenuCache } = require("./controllers/menuController");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const mainRoutes = require("./routes/mainRoutes");

const app = express();
const server = http.createServer(app);

initSocket(server);

const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Set short-term caching headers for public GETs to /api/menu
app.use("/api/menu", (req, res, next) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=60");
  }
  next();
});
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", mainRoutes);

// Health check for uptime monitoring/load balancers
app.get("/health", (req, res) => res.status(200).send("ok"));

// Root endpoint for human checks (avoids provider 404 HTML with strict CSP)
app.get('/', (req, res) => {
  res.type('text/plain').send('Livorno API is running');
});

// Silence browser favicon requests (avoid ORB/CSP warnings when viewing root)
app.get('/favicon.ico', (req, res) => res.status(204).end());

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log("CORS allowed origins:", allowedOrigins);
  testConnection();
  primeMenuCache().catch((err) => {
    console.warn("Initial menu cache prime failed:", err.message);
  });
});
