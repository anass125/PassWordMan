const { getRedisClient } = require("../config/redis");

const CACHE_TTL_SECONDS = 300; // 5 minutes

/**
 * Builds the cache key from the request context.
 * Supports dynamic key builders passed as a function.
 *
 * @param {Function|string} keyBuilder - Static key string OR function(req) => string
 */
const cacheMiddleware = (keyBuilder) => {
  return async (req, res, next) => {
    // Skip caching if Redis is unavailable — fail open
    let redis;
    try {
      redis = getRedisClient();
    } catch (err) {
      console.error("[Cache] Redis client unavailable, skipping cache:", err.message);
      return next();
    }

    // Resolve cache key
    const cacheKey =
      typeof keyBuilder === "function" ? keyBuilder(req) : keyBuilder;

    if (!cacheKey) {
      console.warn("[Cache] No cache key resolved, skipping cache");
      return next();
    }

    try {
      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log(`[Cache] HIT — ${cacheKey}`);
        return res.status(200).json({
          success: true,
          fromCache: true,
          data: JSON.parse(cached),
        });
      }

      console.log(`[Cache] MISS — ${cacheKey}`);

      // Intercept res.json so we can cache the response before sending it
      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
          try {
            await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(body.data));
            console.log(`[Cache] SET — ${cacheKey} (TTL: ${CACHE_TTL_SECONDS}s)`);
          } catch (cacheWriteErr) {
            // Non-fatal — response still goes through
            console.error("[Cache] Failed to write to cache:", cacheWriteErr.message);
          }
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      // Redis read failure — degrade gracefully
      console.error("[Cache] Read error:", err.message);
      next();
    }
  };
};

/**
 * Invalidates one or more cache keys.
 * Use this in controllers after create/update/delete operations.
 *
 * @param {string[]} keys - Array of cache keys to delete
 */
const invalidateCache = async (...keys) => {
  let redis;
  try {
    redis = getRedisClient();
  } catch (err) {
    console.error("[Cache] Redis client unavailable, skipping invalidation:", err.message);
    return;
  }

  const validKeys = keys.filter(Boolean);
  if (!validKeys.length) return;

  try {
    await redis.del(...validKeys);
    console.log(`[Cache] INVALIDATED — ${validKeys.join(", ")}`);
  } catch (err) {
    console.error("[Cache] Invalidation error:", err.message);
  }
};

module.exports = { cacheMiddleware, invalidateCache };