const logger = require("../utils/logger");

// All recognized activity types — keeps logging consistent across the app
const ACTIVITY_TYPES = Object.freeze({
  PASSWORD_CREATED: "PASSWORD_CREATED",
  PASSWORD_UPDATED: "PASSWORD_UPDATED",
  PASSWORD_DELETED: "PASSWORD_DELETED",
  PASSWORD_VIEWED:  "PASSWORD_VIEWED",
  LOGIN_SUCCESS:    "LOGIN_SUCCESS",
  LOGIN_FAILED:     "LOGIN_FAILED",
  EXPORT_VAULT:     "EXPORT_VAULT",
  SECURITY_AUDIT:   "SECURITY_AUDIT",
});

/**
 * Persists an activity log entry to the database.
 *
 * This runs async — it must NOT block the HTTP response path.
 * Any failure here should never crash or delay the user-facing request.
 *
 * @param {import("bullmq").Job} job
 */
const handleActivityLogging = async (job) => {
  const {
    userId,
    activityType,
    resourceId,    // passwordId, vaultId, etc.
    resourceType,  // "password" | "vault" | "user"
    ipAddress,
    userAgent,
    metadata,      // any extra context the caller wants to attach
    timestamp,
  } = job.data;

  logger.info("Job:activityLogging", "Processing", {
    jobId: job.id,
    userId,
    activityType,
  });

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!userId || !activityType) {
    throw new Error(
      `[activityLogging] Missing required fields. userId: ${userId}, activityType: ${activityType}`
    );
  }

  if (!ACTIVITY_TYPES[activityType]) {
    logger.warn("Job:activityLogging", "Unrecognized activityType", {
      activityType,
    });
    // Don't throw — still log it, just warn
  }

  // ── Persist to DB ─────────────────────────────────────────────────────────
  const logEntry = {
    userId,
    activityType,
    resourceId:   resourceId   || null,
    resourceType: resourceType || null,
    ipAddress:    ipAddress    || null,
    userAgent:    userAgent    || null,
    metadata:     metadata     || {},
    timestamp:    timestamp    || new Date().toISOString(),
  };

  logger.info("Job:activityLogging", "Saving activity log", logEntry);
  // e.g. await ActivityLog.create(logEntry);

  logger.info("Job:activityLogging", "Completed", {
    jobId: job.id,
    userId,
    activityType,
  });
};

module.exports = { handleActivityLogging, ACTIVITY_TYPES };