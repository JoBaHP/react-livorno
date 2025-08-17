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

const allowedOrigins = process.env.FRONTEND_URLS.split(",");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
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
