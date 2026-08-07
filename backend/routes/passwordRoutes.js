


const express = require("express");
const router = express.Router();

const {
  getAllPasswords,
  createPassword,
  updatePassword,
  deletePassword,
} = require("../controllers/passwordController");

const { protect } = require("../middleware/authMiddleware");
const { sensitiveReadLimiter } = require("../middleware/rateLimiter");
const { passwordEntryRules, runValidation } = require("../middleware/validate");
const { cacheMiddleware } = require("../middleware/cache"); // ← added

// ─── Cache Key Builder ────────────────────────────────────────────────────────
// Must match allPasswordsKey() in passwordController.js
// Defined here so the route is self-documenting
const allPasswordsCacheKey = (req) => `passwords:${req.user.id}`;

// ─── AUTH WALL ────────────────────────────────────────────────────────────────
// Runs before every route in this file.
// An invalid or missing token never reaches a controller.
router.use(protect);

// ─── ROUTES ──────────────────────────────────────────────────────────────────

router.get(
  "/",
  sensitiveReadLimiter,                   // 30 req/min — prevents bulk credential harvesting
  cacheMiddleware(allPasswordsCacheKey),  // ← serve from cache if available
  getAllPasswords
);

router.post(
  "/",
  passwordEntryRules,   // Validate: site, username, password, optional notes
  runValidation,        // Invalid input → errorHandler, never reaches controller
  createPassword        // invalidates passwords:userId cache internally
);

router.put(
  "/:id",
  passwordEntryRules,   // Same rules apply on update as on create
  runValidation,
  updatePassword        // invalidates passwords:userId cache internally
);

router.delete(
  "/:id",
  deletePassword        // No body to validate — ID comes from params
                        // invalidates passwords:userId cache internally
);

module.exports = router;