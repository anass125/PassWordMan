const jwt = require("jsonwebtoken");

// Generates a signed JWT containing userId and role.
// Expiration is pulled from .env so it can be changed without code changes.
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE, // e.g. "7d"
    }
  );
};

module.exports = generateToken;