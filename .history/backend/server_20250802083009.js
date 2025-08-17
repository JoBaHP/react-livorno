const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { initSocket } = require("./socket");
const { testConnection } = require("./config/db");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const mainRoutes = require("./routes/mainRoutes");

const app = express();
const server = http.createServer(app);

initSocket(server);

// --- FIX ---
// This detailed CORS configuration is necessary to allow cookies
// to be sent from a different origin (localhost:3000 to localhost:3001).
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // This is the crucial setting that was missing
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", mainRoutes);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  testConnection();
});
