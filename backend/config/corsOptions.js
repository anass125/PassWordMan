// // // Whitelist of allowed origins
// // // In production, pull this from an environment variable
// // const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
// //   .split(",")
// //   .map((o) => o.trim())
// //   .filter(Boolean);

// // const corsOptions = {
// //   origin: (origin, callback) => {
// //     // Allow requests with no origin (mobile apps, curl, Postman in dev)
// //     if (!origin) {
// //       if (process.env.NODE_ENV === "production") {
// //         // Block originless requests in production
// //         return callback(new Error("CORS: No origin header"), false);
// //       }
// //       return callback(null, true);
// //     }

// //     if (allowedOrigins.includes(origin)) {
// //       return callback(null, true);
// //     }

// //     return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
// //   },

// //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
// //   allowedHeaders: ["Content-Type", "Authorization"],

// //   // Expose this header so the client can read it
// //   exposedHeaders: ["X-Total-Count"],

// //   // Allow cookies / auth headers to be sent cross-origin
// //   credentials: true,

// //   // Cache preflight response for 10 minutes
// //   maxAge: 600,
// // };

// // module.exports = corsOptions;


//New Allowed Origin for cors at deployment time.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      if (process.env.NODE_ENV === "production") {
        return callback(new Error("CORS: No origin header"), false);
      }
      return callback(null, true);
    }
    // Allow any vercel.app subdomain
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  credentials: true,
  maxAge: 600,
};

module.exports = corsOptions;