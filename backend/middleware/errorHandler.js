// Centralized error handler — must be registered LAST in server.js
// Catches all errors passed via next(err)

const errorHandler = (err, req, res, next) => {
  // Log full error server-side
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    ip: req.ip,
  });

  // CORS errors set by corsOptions
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, error: err.message });
  }

  // express-validator errors (thrown manually via validationResult)
  if (err.type === "validation") {
    return res.status(422).json({
      success: false,
      error: "Validation failed",
      details: err.details,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ success: false, error: "Validation failed", details });
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Token expired" });
  }

  // Default fallback — never leak stack traces in production
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
};

// Catch-all for unmatched routes
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };