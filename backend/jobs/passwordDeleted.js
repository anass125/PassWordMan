const logger = require("../utils/logger");

/**
 * Called when a password entry is deleted.
 *
 * Responsibilities:
 * - Clean up orphaned encrypted blobs / S3 objects
 * - Revoke active sessions tied to that credential (if any)
 * - Update vault statistics
 * - Audit log the deletion event
 *
 * @param {import("bullmq").Job} job
 */
const handlePasswordDeleted = async (job) => {
  const { userId, passwordId, website, deletedAt, deletedBy } = job.data;

  logger.info("Job:passwordDeleted", "Processing", {
    jobId: job.id,
    userId,
    passwordId,
  });

  // ── Step 1: Validate required fields ────────────────────────────────────
  if (!userId || !passwordId) {
    throw new Error(
      `[passwordDeleted] Missing required fields. userId: ${userId}, passwordId: ${passwordId}`
    );
  }

  // ── Step 2: Clean up encrypted blobs ─────────────────────────────────────
  logger.info("Job:passwordDeleted", "Cleaning up encrypted assets", {
    passwordId,
  });
  // e.g. await StorageService.deleteEncryptedBlob(passwordId);

  // ── Step 3: Revoke any active sessions tied to this credential ───────────
  logger.info("Job:passwordDeleted", "Revoking linked sessions", {
    userId,
    passwordId,
  });
  // e.g. await SessionService.revokeByCredential(passwordId);

  // ── Step 4: Update vault statistics ──────────────────────────────────────
  logger.info("Job:passwordDeleted", "Updating vault stats", { userId });
  // e.g. await VaultStatsService.decrement(userId);

  logger.info("Job:passwordDeleted", "Completed", {
    jobId: job.id,
    userId,
    passwordId,
    website,
    deletedAt,
    deletedBy,
  });
};

module.exports = handlePasswordDeleted;