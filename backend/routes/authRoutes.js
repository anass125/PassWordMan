

const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerRules, loginRules, runValidation } = require("../middleware/validate");

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

router.post(
  "/register",
  authLimiter,       // 10 attempts per 15 min — blocks signup spam
  registerRules,     // Validate: email format, password strength, name length
  runValidation,     // If invalid → passes structured error to errorHandler
  registerUser
);

router.post(
  "/login",
  authLimiter,       // Same tight limit — every excess attempt is a brute-force risk
  loginRules,        // Validate: email format, password not empty
  runValidation,
  loginUser
);

// ─── PROTECTED ROUTES ────────────────────────────────────────────────────────

router.get(
  "/profile",
  protect,           // Verify JWT first — no point validating an unauthenticated request
  getProfile
);

module.exports = router;