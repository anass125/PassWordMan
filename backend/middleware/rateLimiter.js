const rateLimit = require("express-rate-limit");

// Shared config defaults — extend per route as needed
const baseConfig = {
  standardHeaders: true,  // Send RateLimit-* headers (RFC 6585)
  legacyHeaders: false,   // Disable deprecated X-RateLimit-* headers

  // Generic error message — do NOT reveal limit specifics to attackers
  message: {
    status: 429,
    error: "Too many requests. Please try again later.",
  },

  // Skip rate limiting for successful responses (optional — remove if you
  // want to count all requests regardless of outcome)
  skipSuccessfulRequests: false,
};

// Applied to every API route
const globalLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100,                  // 100 requests per window per IP
  message: {
    ...baseConfig.message,
    error: "Too many requests from this IP. Try again in 15 minutes.",
  },
});

// Applied to auth routes: login, register, password reset
// Tight window to slow down brute-force and credential stuffing
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // Only 10 attempts per window
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    ...baseConfig.message,
    error: "Too many auth attempts. Account temporarily locked. Try in 15 minutes.",
  },
});

// Applied to password-fetch routes
// Prevents bulk credential harvesting even with a valid token
const sensitiveReadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1-minute window
  max: 30,
  message: {
    ...baseConfig.message,
    error: "Too many read requests. Slow down.",
  },
});

module.exports = { globalLimiter, authLimiter, sensitiveReadLimiter };