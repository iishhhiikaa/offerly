import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { initSocket } from "./config/socket.js";

import connectDB from "./config/db.js";
import adminRoutes from "./modules/admin/routes/adminRoutes.js";
import adminCategoryRoutes from "./modules/admin/routes/categoryRoutes.js";
import cityRoutes from "./modules/admin/routes/cityRoutes.js";
import planRoutes from "./modules/admin/routes/planRoutes.js";
import redemptionRoutes from "./modules/booking/routes/redemptionRoutes.js";
import cartRoutes from "./modules/booking/routes/cartRoutes.js";
import merchantRoutes from "./modules/merchant/routes/merchantRoutes.js";
import offerRoutes from "./modules/merchant/routes/offerRoutes.js";
import productRoutes from "./modules/merchant/routes/productRoutes.js";
import reviewRoutes from "./modules/merchant/routes/reviewRoutes.js";
import servicePlanRoutes from "./modules/merchant/routes/servicePlanRoutes.js";
import variantRoutes from "./modules/merchant/routes/variantRoutes.js";
import paymentRoutes from "./modules/payment/routes/paymentRoutes.js";
import authRoutes from "./modules/user/routes/authRoutes.js";
import userRoutes from "./modules/user/routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { seedDefaultAdmin } from "./modules/admin/utils/adminSeeder.js";
import { seedCategories } from "./seeders/categorySeeder.js";
import { initCronJobs } from "./scripts/cronJobs.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",").map((item) => item.trim()) || true,
    credentials: true,
  }),
);

app.use(
  express.json({
    // KYB onboarding currently sends base64 document payloads in JSON.
    // Keep this large enough to avoid 413/request entity too large errors.
    limit: "30mb",
    verify: (req, _res, buffer) => {
      req.rawBody = buffer.toString("utf8");
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

const enableRequestLogs = process.env.ENABLE_REQUEST_LOGS === "true";
const logRequestBody = process.env.LOG_REQUEST_BODY === "true";

if (enableRequestLogs) {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (logRequestBody && req.body && Object.keys(req.body).length > 0) {
      console.log("Body keys:", Object.keys(req.body));
    }
    next();
  });
}

app.get("/api/health", (_req, res) => {
  const connectionState =
    typeof connectDB.connectionState === "function" ? connectDB.connectionState() : "unknown";

  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: connectionState,
    routes: {
      auth: true,
      users: true,
      merchants: true,
      products: true,
      offers: true,
      bookings: true,
      admin: true,
      payments: true,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/service-plans", servicePlanRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/redemptions", redemptionRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
});

const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();
  await seedCategories();

  initCronJobs();
  initSocket(httpServer);

  httpServer.listen(port, () => {
    console.log(`Offerly backend running on port ${port} with Socket.io`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

export default app;
