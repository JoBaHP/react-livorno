const express = require("express");
const http = require("http");
const cors = require("cors");
const { initSocket } = require("./socket");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const mainRoutes = require("./routes/mainRoutes");

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", mainRoutes);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
