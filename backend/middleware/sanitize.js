const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Block MongoDB operator injection in req.body, req.params, req.query
// e.g. { "email": { "$gt": "" } } becomes { "email": {} }
const sanitizeMongo = mongoSanitize({
  replaceWith: "_",       // Replace $ and . with _ instead of stripping
  allowDots: false,       // Block dot-notation injection in keys
  onSanitize: ({ req, key }) => {
    // Log sanitization events — treat these as security signals in production
    console.warn(`[SECURITY] Mongo injection attempt sanitized. Key: ${key} | IP: ${req.ip}`);
  },
});

// Strip HTML/JS from user input to prevent XSS
// Operates on req.body, req.query, req.params
const sanitizeXSS = xss();

// Prevent HTTP Parameter Pollution
// e.g. ?sort=name&sort=price — hpp keeps only the last value
// Whitelist params where arrays are valid (e.g. filtering by multiple tags)
const sanitizeHPP = hpp({
  whitelist: ["tags", "category", "fields"], // adjust to your query params
});

module.exports = { sanitizeMongo, sanitizeXSS, sanitizeHPP };