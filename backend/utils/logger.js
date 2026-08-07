// Minimal structured logger — swap with Winston/Pino in production
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

const format = (level, context, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(Object.keys(meta).length ? { meta } : {}),
  };
  return JSON.stringify(entry);
};

const logger = {
  error: (context, message, meta) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.error)
      console.error(format("error", context, message, meta));
  },
  warn: (context, message, meta) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.warn)
      console.warn(format("warn", context, message, meta));
  },
  info: (context, message, meta) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.info)
      console.log(format("info", context, message, meta));
  },
  debug: (context, message, meta) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.debug)
      console.log(format("debug", context, message, meta));
  },
};

module.exports = logger;