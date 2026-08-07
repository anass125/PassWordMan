const logger = require("../utils/logger");

/**
 * Called when a new password entry is created.
 *
 * Responsibilities:
 * - Trigger strength analysis
 * - Check for duplicate/reused passwords
 * - Send user notification (email, push) if needed
 * - Update vault statistics
 *
 * @param {import("bullmq").Job} job
 */
const handlePasswordCreated = async (job) => {
  const { userId, passwordId, website, username, createdAt } = job.data;

  logger.info("Job:passwordCreated", "Processing", {
    jobId: job.id,
    userId,
    passwordId,
  });

  // ── Step 1: Validate required fields ────────────────────────────────────
  if (!userId || !passwordId) {
    throw new Error(
      `[passwordCreated] Missing required fields. userId: ${userId}, passwordId: ${passwordId}`
    );
  }

  // ── Step 2: Password strength / duplicate analysis ───────────────────────
  // Replace with your actual service calls
  logger.info("Job:passwordCreated", "Running strength analysis", {
    passwordId,
    website,
  });
  // e.g. await PasswordAnalysisService.analyze(passwordId);

  // ── Step 3: Update vault statistics ─────────────────────────────────────
  logger.info("Job:passwordCreated", "Updating vault stats", { userId });
  // e.g. await VaultStatsService.increment(userId);

  // ── Step 4: Send notification ────────────────────────────────────────────
  logger.info("Job:passwordCreated", "Dispatching notification", {
    userId,
    website,
  });
  // e.g. await NotificationService.passwordAdded(userId, website);

  logger.info("Job:passwordCreated", "Completed", {
    jobId: job.id,
    userId,
    passwordId,
    website,
    username,
    createdAt,
  });
};

module.exports = handlePasswordCreated;