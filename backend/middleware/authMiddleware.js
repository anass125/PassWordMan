const jwt = require("jsonwebtoken");
const User = require("../models/User");

// -------------------------------------------------------
// protect middleware
// Verifies the JWT from the Authorization header.
// Attaches the decoded user object to req.user.
// All protected routes must use this middleware first.
// -------------------------------------------------------
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token must be sent as: Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided. Access denied." });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to ensure they still exist
    // (handles cases where user was deleted after token was issued)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Attach user data to request for downstream use
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // jwt.verify throws JsonWebTokenError or TokenExpiredError
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Access denied." });
  }
};

module.exports = { protect };