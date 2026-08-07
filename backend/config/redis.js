// const Redis = require("ioredis");

// let redisClient = null;

// const connectRedis = () => {
//   if (redisClient) return redisClient;

//   redisClient = new Redis(process.env.REDIS_URL, {  // ← pass URL directly
//     tls: {
//       rejectUnauthorized: false,                     // ← required for Upstash
//     },
//     retryStrategy(times) {
//       const delay = Math.min(times * 100, 3000);
//       console.warn(`[Redis] Reconnecting... attempt ${times} (delay: ${delay}ms)`);
//       return delay;
//     },
//     lazyConnect: false,
//     enableOfflineQueue: false,
//   });

//   redisClient.on("connect", () => console.log("[Redis] Connected successfully"));
//   redisClient.on("error", (err) => console.error("[Redis] Connection error:", err.message));
//   redisClient.on("close", () => console.warn("[Redis] Connection closed"));

//   return redisClient;
// };

// const getRedisClient = () => {
//   if (!redisClient) throw new Error("[Redis] Client not initialized. Call connectRedis() first.");
//   return redisClient;
// };

// module.exports = { connectRedis, getRedisClient };


const Redis = require("ioredis");

let redisClient = null;

const connectRedis = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis(process.env.REDIS_URL, {  // ← pass URL directly
    tls: {
      rejectUnauthorized: false,                     // ← required for Upstash
    },
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      console.warn(`[Redis] Reconnecting... attempt ${times} (delay: ${delay}ms)`);
      return delay;
    },
    lazyConnect: false,
    enableOfflineQueue: false,
  });

  redisClient.on("connect", () => console.log("[Redis] Connected successfully"));
  redisClient.on("error", (err) => console.error("[Redis] Connection error:", err.message));
  redisClient.on("close", () => console.warn("[Redis] Connection closed"));

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) throw new Error("[Redis] Client not initialized. Call connectRedis() first.");
  return redisClient;
};

// ── BullMQ connection factory ──────────────────────────────────────────────
// BullMQ requires a NEW Redis instance per queue/worker — it cannot share
// the singleton above. It also requires these two options to be set:
//   maxRetriesPerRequest: null  → lets BullMQ manage its own retry logic
//   enableReadyCheck: false     → required for Upstash + BullMQ compatibility
//
// All other options (URL, TLS, retryStrategy) are kept identical to above
// so both connections behave consistently against the same Upstash instance.
const createRedisConnection = () =>
  new Redis(process.env.REDIS_URL, {
    tls: {
      rejectUnauthorized: false,
    },
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      console.warn(`[Redis:BullMQ] Reconnecting... attempt ${times} (delay: ${delay}ms)`);
      return delay;
    },
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,    // Required by BullMQ + Upstash
  });

module.exports = { connectRedis, getRedisClient, createRedisConnection };