const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// protect runs first (checks JWT), then authorizeRoles checks the role.
// Any non-admin hitting this gets a 403.
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json({ count: users.length, users });
    } catch (error) {
      console.error("admin/users error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;