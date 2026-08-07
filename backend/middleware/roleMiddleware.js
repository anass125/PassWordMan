// -------------------------------------------------------
// authorizeRoles middleware factory
//
// Usage: authorizeRoles("admin") or authorizeRoles("admin", "manager")
//
// Must be used AFTER protect middleware since it depends on req.user.
// -------------------------------------------------------
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is guaranteed to exist if protect ran before this
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: [${allowedRoles.join(", ")}]. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };