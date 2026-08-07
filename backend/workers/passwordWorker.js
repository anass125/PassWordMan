const { Worker } = require("bullmq");
const { createRedisConnection } = require("../config/redis");
const logger = require("../utils/logger");
const { QUEUE_NAME } = require("../queues/passwordQueue");

// Job handlers
const handlePasswordCreated = require("../jobs/passwordCreated");
const handlePasswordDeleted = require("../jobs/passwordDeleted");
const handleSecurityAudit   = require("../jobs/securityAudit");
const { handleActivityLogging } = require("../jobs/activityLogging");

// ── Job Router ─────────────────────────────────────────────────────────────
// Map job names to their handler functions.
// Adding a new job type = one line here + one file in /jobs.
const JOB_HANDLERS = {
  passwordCreated: handlePasswordCreated,
  passwordDeleted: handlePasswordDeleted,
  securityAudit:   handleSecurityAudit,
  activityLogging: handleActivityLogging,
};

// ── Processor ──────────────────────────────────────────────────────────────
const processor = async (job) => {
  const handler = JOB_HANDLERS[job.name];

  if (!handler) {
    // Unknown job — fail fast, don't retry (unrecoverable without code change)
    const msg = `[PasswordWorker] No handler registered for job: "${job.name}"`;
    logger.error("PasswordWorker", msg, { jobId: job.id });
    throw new Error(msg);
  }

  logger.info("PasswordWorker", `Starting job: ${job.name}`, {
    jobId: job.id,
    attempt: job.attemptsMade + 1,
    data: job.data,
  });

  await handler(job);

  logger.info("PasswordWorker", `Finished job: ${job.name}`, {
    jobId: job.id,
  });
};

// ── Worker Instance ────────────────────────────────────────────────────────
let worker; // Exported so server.js can shut it down cleanly

const startWorker = () => {
  // Workers need their own dedicated Redis connection
  const workerConnection = createRedisConnection();

  worker = new Worker(QUEUE_NAME, processor, {
    connection: workerConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY, 10) || 5,
    limiter: {
      // Optional: rate-limit to max 50 jobs per 10s to protect downstream services
      max: 50,
      duration: 10_000,
    },
  });

  // ── Worker Events ──────────────────────────────────────────────────────
  worker.on("completed", (job) => {
    logger.info("PasswordWorker", "Job completed", {
      jobId: job.id,
      jobName: job.name,
      userId: job.data?.userId,
    });
  });

  worker.on("failed", (job, err) => {
    logger.error("PasswordWorker", "Job failed", {
      jobId: job?.id,
      jobName: job?.name,
      userId: job?.data?.userId,
      attempt: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
      error: err.message,
      stack: err.stack,
    });
  });

  worker.on("error", (err) => {
    logger.error("PasswordWorker", "Worker-level error", {
      error: err.message,
    });
  });

  worker.on("stalled", (jobId) => {
    logger.warn("PasswordWorker", "Job stalled — will be re-queued", { jobId });
  });

  logger.info("PasswordWorker", "Worker started", {
    queue: QUEUE_NAME,
    concurrency: worker.opts.concurrency,
  });

  return worker;
};

// ── Graceful Shutdown ──────────────────────────────────────────────────────
const stopWorker = async () => {
  if (worker) {
    await worker.close();
    logger.info("PasswordWorker", "Worker stopped gracefully");
  }
};

module.exports = { startWorker, stopWorker };