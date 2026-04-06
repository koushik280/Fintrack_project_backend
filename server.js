const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./server/config/swagger");
const { initSocket } = require("./server/socket");
const connetDb = require("./server/config/db");
require("dotenv").config();

const authRoutes = require("./server/routes/authRoutes");
const cardRoutes = require("./server/routes/cardRoutes");
const transactionRoutes = require("./server/routes/transactionRoutes");
const budgetRoutes = require("./server/routes/budgetRoutes");
const analyticsRoutes = require("./server/routes/analyticsRoutes");
const notificationRoute = require("./server/routes/notificationRoutes");
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // allow cookies
  }),
);

// Routes

// Database connection
connetDb();

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", require("./server/routes/Admin/adminRoutes"));
app.use("/api/payments", require("./server/routes/paymentRoutes"));

app.use("/api/admin", require("./server/routes/Admin/adminCategoryRoutes"));
app.use("/api/categories", require("./server/routes/categoryRoutes"));
app.use(
  "/api/admin/content",
  require("./server/routes/Admin/adminContentRoutes"),
);
app.use("/api/content", require("./server/routes/contentRoutes"));

app.use("/api/notifications", notificationRoute);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
initSocket(server);
