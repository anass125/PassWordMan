const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema(
  {
    // Link each password entry to the user who owns it.
    // This is what enforces data isolation between users.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    site: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    // In production, you would encrypt this field at the
    // application level before storing (e.g. using AES-256).
    // Hashing is not suitable here since you need to retrieve the value.
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Password", passwordSchema);