import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "LocalConnect API" }));
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ml", mlRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ message: "A record with this unique value already exists." });
  if (err?.name === "ValidationError") return res.status(400).json({ message: err.message });
  res.status(500).json({ message: "Server error. Check backend logs." });
});

const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`LocalConnect API running at http://localhost:${port}`));
}).catch(err => {
  console.error("Could not start server:", err.message);
  process.exit(1);
});
