const { validationResult, body } = require("express-validator");

// Reusable runner: collects validation errors and passes them to errorHandler
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validation failed");
    err.type = "validation";
    err.details = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(err);
  }
  next();
};

// --- Reusable rule sets ---

const registerRules = [
  body("email")
    .trim()
    .isEmail().withMessage("Valid email required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 12 }).withMessage("Password must be at least 12 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain a special character"),

  // body("name")
  //   .trim()
  //   .notEmpty().withMessage("Name is required")
  //   .isLength({ max: 64 }).withMessage("Name too long")
  //   .escape(), // HTML-encode special chars

  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 64 }).withMessage("Name too long")
    .matches(/^[a-zA-Z0-9\s\-'_.]+$/)
    .withMessage("Name contains invalid characters") // ← rejects < > & entirely
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password required"),
];

const passwordEntryRules = [
  body("site")
    .trim()
    .notEmpty().withMessage("Site name required")
    .isLength({ max: 128 }).withMessage("Site name too long")
    .escape(),

  body("username")
    .trim()
    .notEmpty().withMessage("Username required")
    .isLength({ max: 128 }).withMessage("Username too long")
    .escape(),

  body("password")
    .notEmpty().withMessage("Password required")
    .isLength({ max: 512 }).withMessage("Password too long"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1024 }).withMessage("Notes too long")
    .escape(),
];

module.exports = {
  runValidation,
  registerRules,
  loginRules,
  passwordEntryRules,
};