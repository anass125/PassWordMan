const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// -------------------------------------------------------
// @route   POST /api/auth/register
// @access  Public
// -------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }

    // --- Check for duplicate email ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // --- Create user ---
    // Password gets hashed automatically via the pre-save hook in User model.
    // Do NOT allow clients to self-assign "admin" role in production.
    // Role defaults to "user" unless you have a controlled admin seeding process.
    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "user" : role, // block self-promotion to admin
    });

    // --- Respond with token ---
    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// -------------------------------------------------------
// @route   POST /api/auth/login
// @access  Public
// -------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Input validation ---
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // --- Find user and explicitly include password field (excluded by default) ---
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // Use a generic message — don't tell the client which field is wrong
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // --- Compare passwords ---
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // --- Respond with token ---
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// -------------------------------------------------------
// @route   GET /api/auth/profile
// @access  Private (requires valid JWT)
// -------------------------------------------------------
const getProfile = async (req, res) => {
  try {
    // req.user is attached by the protect middleware after token verification
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("getProfile error:", error.message);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

module.exports = { registerUser, loginUser, getProfile };