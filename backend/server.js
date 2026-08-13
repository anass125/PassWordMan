

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

dotenv.config();

const corsOptions = require("./config/corsOptions");
const { connectRedis } = require("./config/redis");                    // ← existing
const { startWorker, stopWorker } = require("./workers/passwordWorker"); // ← added
const { passwordQueue } = require("./queues/passwordQueue");             // ← added
const { globalLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// ─── SECURITY HEADERS ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: "deny" },
    noSniff: true,
    hidePoweredBy: true,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── SANITIZATION ─────────────────────────────────────────────────────────────
app.use(xss());
app.use(mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Mongo injection blo-cked. Key: ${key} | IP: ${req.ip}`);
  },
}));
app.use(hpp({ whitelist: [] }));

// ─── GLOBAL RATE LIMITER ─────────────────────────────────────────────────────
app.use("/api", globalLimiter);

// ─── TRUST PROXY ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/passwords", passwordRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 + ERROR HANDLING ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── DB + SERVER BOOT ────────────────────────────────────────────────────────
// Redis is non-blocking — a Redis failure should never prevent the app from
// starting. MongoDB failure is fatal (app is useless without the DB).
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[MongoDB] Connected");

    // Connect Redis after DB — errors inside are handled gracefully,
    // so this never throws or blocks the server from starting
    connectRedis();                                                    // ← existing

    // Start BullMQ worker — runs in the same process, picks up queued jobs.
    // Worker connection is managed independently inside startWorker().
    startWorker();                                                     // ← added

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });

    // ── Graceful Shutdown ────────────────────────────────────────────────
    // Order: stop HTTP → drain worker → close queue → disconnect DB
    // This ensures in-flight jobs finish before the process exits.
    const shutdown = async (signal) => {
      console.log(`[Server] ${signal} received — shutting down`);

      server.close(async () => {
        try {
          await stopWorker();           // Wait for active jobs to complete
          await passwordQueue.close();  // Close queue Redis connection
          await mongoose.disconnect();
          console.log("[Server] Shutdown complete");
          process.exit(0);
        } catch (err) {
          console.error("[Server] Shutdown error:", err.message);
          process.exit(1);
        }
      });

      // Force-kill if graceful shutdown takes longer than 15s
      setTimeout(() => {
        console.error("[Server] Forced shutdown after timeout");
        process.exit(1);
      }, 15_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));
    process.on("unhandledRejection", (reason) => {
      console.error("[Server] Unhandled rejection:", String(reason));
    });
  })
  .catch((err) => {
    console.error("[MongoDB] Connection failed:", err.message);
    process.exit(1);
  });