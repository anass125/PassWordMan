const { Queue } = require("bullmq");
const { createRedisConnection } = require("../config/redis");
const logger = require("../utils/logger");

const QUEUE_NAME = "password-queue";

// Default job options applied to every job unless overridden per-job
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential", // 1s → 2s → 4s between retries
    delay: 1000,
  },
  removeOnComplete: {
    age: 60 * 60 * 24,  // Keep completed jobs for 24h (for audit trail)
    count: 500,          // Cap at 500 completed jobs
  },
  removeOnFail: {
    age: 60 * 60 * 24 * 7, // Keep failed jobs for 7 days
  },
};

// One connection instance per queue (BullMQ requirement)
const queueConnection = createRedisConnection();

queueConnection.on("error", (err) => {
  logger.error("PasswordQueue", "Redis connection error", { error: err.message });
});

const passwordQueue = new Queue(QUEUE_NAME, {
  connection: queueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

passwordQueue.on("error", (err) => {
  logger.error("PasswordQueue", "Queue error", { error: err.message });
});

/**
 * Add a job to the password queue.
 *
 * @param {string} jobName - One of: passwordCreated | passwordDeleted | securityAudit | activityLogging
 * @param {object} payload  - Job data (userId, passwordId, metadata, etc.)
 * @param {object} [options] - Optional per-job BullMQ options to override defaults
 * @returns {Promise<Job>}
 */
const addJob = async (jobName, payload, options = {}) => {
  try {
    const job = await passwordQueue.add(jobName, payload, options);
    logger.info("PasswordQueue", "Job added", {
      jobName,
      jobId: job.id,
      userId: payload.userId,
    });
    return job;
  } catch (err) {
    logger.error("PasswordQueue", "Failed to add job", {
      jobName,
      error: err.message,
    });
    throw err; // Let the caller decide whether to fail hard or degrade gracefully
  }
};

module.exports = { passwordQueue, addJob, QUEUE_NAME };