import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "./utils/database";
import { config } from "./config";
import { generalLimiter } from "./middleware/rateLimiter";

import { authRoutes } from "./routes/auth";
import { taskRoutes } from "./routes/tasks";
import { analyticsRoutes } from "./routes/analytics";

const app = express();

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(generalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== "test") {
  app.use(morgan("combined"));
}

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Task Management API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
      ...(config.nodeEnv === "development" && { stack: error.stack }),
    });
  }
);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
