// // const Password = require("../models/Password");

// // // -------------------------------------------------------
// // // All controllers here filter by req.user.id.
// // // This ensures users can only ever touch their own data,
// // // regardless of what ID they pass in the body or params.
// // // -------------------------------------------------------

// // // @route   GET /api/passwords
// // // @access  Private
// // const getAllPasswords = async (req, res) => {
// //   try {
// //     const passwords = await Password.find({ user: req.user.id }).sort({ createdAt: -1 });
// //     res.status(200).json({ count: passwords.length, passwords });
// //   } catch (error) {
// //     console.error("getAllPasswords error:", error.message);
// //     res.status(500).json({ message: "Server error fetching passwords" });
// //   }
// // };

// // // @route   POST /api/passwords
// // // @access  Private
// // const createPassword = async (req, res) => {
// //   try {
// //     const { site, username, password, notes } = req.body;

// //     if (!site || !username || !password) {
// //       return res.status(400).json({ message: "Site, username and password are required" });
// //     }

// //     const newEntry = await Password.create({
// //       user: req.user.id, // always bind to the authenticated user
// //       site,
// //       username,
// //       password,
// //       notes,
// //     });

// //     res.status(201).json({ message: "Password saved", password: newEntry });
// //   } catch (error) {
// //     console.error("createPassword error:", error.message);
// //     res.status(500).json({ message: "Server error creating password" });
// //   }
// // };

// // // @route   PUT /api/passwords/:id
// // // @access  Private
// // const updatePassword = async (req, res) => {
// //   try {
// //     // Scope the query to the current user — prevents horizontal privilege escalation
// //     const entry = await Password.findOne({ _id: req.params.id, user: req.user.id });

// //     if (!entry) {
// //       // Return 404 regardless of whether entry exists or just belongs to another user.
// //       // Never reveal that the resource exists but is forbidden.
// //       return res.status(404).json({ message: "Password entry not found" });
// //     }

// //     const { site, username, password, notes } = req.body;

// //     entry.site = site ?? entry.site;
// //     entry.username = username ?? entry.username;
// //     entry.password = password ?? entry.password;
// //     entry.notes = notes ?? entry.notes;

// //     await entry.save();

// //     res.status(200).json({ message: "Password updated", password: entry });
// //   } catch (error) {
// //     console.error("updatePassword error:", error.message);
// //     res.status(500).json({ message: "Server error updating password" });
// //   }
// // };

// // // @route   DELETE /api/passwords/:id
// // // @access  Private
// // const deletePassword = async (req, res) => {
// //   try {
// //     const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.user.id });

// //     if (!entry) {
// //       return res.status(404).json({ message: "Password entry not found" });
// //     }

// //     res.status(200).json({ message: "Password deleted" });
// //   } catch (error) {
// //     console.error("deletePassword error:", error.message);
// //     res.status(500).json({ message: "Server error deleting password" });
// //   }
// // };

// // module.exports = { getAllPasswords, createPassword, updatePassword, deletePassword };


// const Password = require("../models/Password");
// const { invalidateCache } = require("../middleware/cache");

// // ─── Cache Key Helpers ────────────────────────────────────────────────────────
// // Defined once here — must match the key used in passwordRoutes.js
// const allPasswordsKey = (userId) => `passwords:${userId}`;

// // -------------------------------------------------------
// // All controllers filter by req.user.id.
// // Users can only ever touch their own data,
// // regardless of what ID they pass in the body or params.
// // -------------------------------------------------------

// // @route   GET /api/passwords
// // @access  Private
// const getAllPasswords = async (req, res) => {
//   try {
//     const passwords = await Password.find({ user: req.user.id }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       data: { count: passwords.length, passwords },
//     });
//   } catch (error) {
//     console.error("getAllPasswords error:", error.message);
//     res.status(500).json({ success: false, message: "Server error fetching passwords" });
//   }
// };

// // @route   POST /api/passwords
// // @access  Private
// const createPassword = async (req, res) => {
//   try {
//     const { site, username, password, notes } = req.body;

//     if (!site || !username || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Site, username and password are required" });
//     }

//     const newEntry = await Password.create({
//       user: req.user.id,
//       site,
//       username,
//       password,
//       notes,
//     });

//     // New entry added — the cached list for this user is now stale
//     await invalidateCache(allPasswordsKey(req.user.id));

//     res.status(201).json({
//       success: true,
//       data: { message: "Password saved", password: newEntry },
//     });
//   } catch (error) {
//     console.error("createPassword error:", error.message);
//     res.status(500).json({ success: false, message: "Server error creating password" });
//   }
// };

// // @route   PUT /api/passwords/:id
// // @access  Private
// const updatePassword = async (req, res) => {
//   try {
//     // Scope to current user — prevents horizontal privilege escalation
//     const entry = await Password.findOne({ _id: req.params.id, user: req.user.id });

//     if (!entry) {
//       // 404 regardless of whether the entry exists but belongs to someone else.
//       // Never reveal that a resource exists but is forbidden.
//       return res.status(404).json({ success: false, message: "Password entry not found" });
//     }

//     const { site, username, password, notes } = req.body;

//     entry.site     = site     ?? entry.site;
//     entry.username = username ?? entry.username;
//     entry.password = password ?? entry.password;
//     entry.notes    = notes    ?? entry.notes;

//     await entry.save();

//     // A changed entry makes the full list stale too
//     await invalidateCache(allPasswordsKey(req.user.id));

//     res.status(200).json({
//       success: true,
//       data: { message: "Password updated", password: entry },
//     });
//   } catch (error) {
//     console.error("updatePassword error:", error.message);
//     res.status(500).json({ success: false, message: "Server error updating password" });
//   }
// };

// // @route   DELETE /api/passwords/:id
// // @access  Private
// const deletePassword = async (req, res) => {
//   try {
//     const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.user.id });

//     if (!entry) {
//       return res.status(404).json({ success: false, message: "Password entry not found" });
//     }

//     // Entry removed — cached list must be invalidated
//     await invalidateCache(allPasswordsKey(req.user.id));

//     res.status(200).json({
//       success: true,
//       data: { message: "Password deleted" },
//     });
//   } catch (error) {
//     console.error("deletePassword error:", error.message);
//     res.status(500).json({ success: false, message: "Server error deleting password" });
//   }
// };

// module.exports = { getAllPasswords, createPassword, updatePassword, deletePassword };

// const Password = require("../models/Password");

// // -------------------------------------------------------
// // All controllers here filter by req.user.id.
// // This ensures users can only ever touch their own data,
// // regardless of what ID they pass in the body or params.
// // -------------------------------------------------------

// // @route   GET /api/passwords
// // @access  Private
// const getAllPasswords = async (req, res) => {
//   try {
//     const passwords = await Password.find({ user: req.user.id }).sort({ createdAt: -1 });
//     res.status(200).json({ count: passwords.length, passwords });
//   } catch (error) {
//     console.error("getAllPasswords error:", error.message);
//     res.status(500).json({ message: "Server error fetching passwords" });
//   }
// };

// // @route   POST /api/passwords
// // @access  Private
// const createPassword = async (req, res) => {
//   try {
//     const { site, username, password, notes } = req.body;

//     if (!site || !username || !password) {
//       return res.status(400).json({ message: "Site, username and password are required" });
//     }

//     const newEntry = await Password.create({
//       user: req.user.id, // always bind to the authenticated user
//       site,
//       username,
//       password,
//       notes,
//     });

//     res.status(201).json({ message: "Password saved", password: newEntry });
//   } catch (error) {
//     console.error("createPassword error:", error.message);
//     res.status(500).json({ message: "Server error creating password" });
//   }
// };

// // @route   PUT /api/passwords/:id
// // @access  Private
// const updatePassword = async (req, res) => {
//   try {
//     // Scope the query to the current user — prevents horizontal privilege escalation
//     const entry = await Password.findOne({ _id: req.params.id, user: req.user.id });

//     if (!entry) {
//       // Return 404 regardless of whether entry exists or just belongs to another user.
//       // Never reveal that the resource exists but is forbidden.
//       return res.status(404).json({ message: "Password entry not found" });
//     }

//     const { site, username, password, notes } = req.body;

//     entry.site = site ?? entry.site;
//     entry.username = username ?? entry.username;
//     entry.password = password ?? entry.password;
//     entry.notes = notes ?? entry.notes;

//     await entry.save();

//     res.status(200).json({ message: "Password updated", password: entry });
//   } catch (error) {
//     console.error("updatePassword error:", error.message);
//     res.status(500).json({ message: "Server error updating password" });
//   }
// };

// // @route   DELETE /api/passwords/:id
// // @access  Private
// const deletePassword = async (req, res) => {
//   try {
//     const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.user.id });

//     if (!entry) {
//       return res.status(404).json({ message: "Password entry not found" });
//     }

//     res.status(200).json({ message: "Password deleted" });
//   } catch (error) {
//     console.error("deletePassword error:", error.message);
//     res.status(500).json({ message: "Server error deleting password" });
//   }
// };

// module.exports = { getAllPasswords, createPassword, updatePassword, deletePassword };


const Password = require("../models/Password");
const { invalidateCache } = require("../middleware/cache");
const { addJob } = require("../queues/passwordQueue");                   // ← added
const { ACTIVITY_TYPES } = require("../jobs/activityLogging");           // ← added

// ─── Cache Key Helpers ────────────────────────────────────────────────────────
// Defined once here — must match the key used in passwordRoutes.js
const allPasswordsKey = (userId) => `passwords:${userId}`;

// ─── Queue Helper ─────────────────────────────────────────────────────────────
// Fire-and-forget activity log — never blocks the HTTP response.
// Failures are swallowed here intentionally; logging must never crash the app.
const logActivity = (userId, activityType, extra = {}) => {
  addJob("activityLogging", {
    userId,
    activityType,
    timestamp: new Date().toISOString(),
    ...extra,
  }).catch((err) =>
    console.error("[Queue] activityLogging enqueue failed:", err.message)
  );
};

// -------------------------------------------------------
// All controllers filter by req.user.id.
// Users can only ever touch their own data,
// regardless of what ID they pass in the body or params.
// -------------------------------------------------------

// @route   GET /api/passwords
// @access  Private
const getAllPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { count: passwords.length, passwords },
    });
  } catch (error) {
    console.error("getAllPasswords error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching passwords" });
  }
};

// @route   POST /api/passwords
// @access  Private
const createPassword = async (req, res) => {
  try {
    const { site, username, password, notes } = req.body;

    if (!site || !username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Site, username and password are required" });
    }

    const newEntry = await Password.create({
      user: req.user.id,
      site,
      username,
      password,
      notes,
    });

    // New entry added — the cached list for this user is now stale
    await invalidateCache(allPasswordsKey(req.user.id));

    // ── Background jobs (non-blocking) ────────────────────────────────────
    // await addJob("passwordCreated", {
    //   userId:     req.user.id,
    //   passwordId: newEntry._id,
    //   site,
    //   username,
    //   createdAt:  newEntry.createdAt,
    // });

    // await addJob("securityAudit", {
    //   userId:      req.user.id,
    //   triggeredBy: "passwordCreated",
    //   auditScope:  "single",
    //   passwordId:  newEntry._id,
    // });

    // NEW — fire and forget, never blocks the response
    addJob("passwordCreated", {
      userId: req.user.id,
      passwordId: newEntry._id,
      site,
      username,
      createdAt: newEntry.createdAt,
    }).catch((err) => console.error("[Queue] passwordCreated enqueue failed:", err.message));

    addJob("securityAudit", {
      userId: req.user.id,
      triggeredBy: "passwordCreated",
      auditScope: "single",
      passwordId: newEntry._id,
    }).catch((err) => console.error("[Queue] securityAudit enqueue failed:", err.message));


    logActivity(req.user.id, ACTIVITY_TYPES.PASSWORD_CREATED, {
      resourceId: newEntry._id,
      resourceType: "password",
      metadata: { site },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    // ─────────────────────────────────────────────────────────────────────

    res.status(201).json({
      success: true,
      data: { message: "Password saved", password: newEntry },
    });
  } catch (error) {
    console.error("createPassword error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating password" });
  }
};

// @route   PUT /api/passwords/:id
// @access  Private
const updatePassword = async (req, res) => {
  try {
    // Scope to current user — prevents horizontal privilege escalation
    const entry = await Password.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      // 404 regardless of whether the entry exists but belongs to someone else.
      // Never reveal that a resource exists but is forbidden.
      return res.status(404).json({ success: false, message: "Password entry not found" });
    }

    const { site, username, password, notes } = req.body;

    entry.site = site ?? entry.site;
    entry.username = username ?? entry.username;
    entry.password = password ?? entry.password;
    entry.notes = notes ?? entry.notes;

    await entry.save();

    // A changed entry makes the full list stale too
    await invalidateCache(allPasswordsKey(req.user.id));

    // ── Background jobs (non-blocking) ────────────────────────────────────
    logActivity(req.user.id, ACTIVITY_TYPES.PASSWORD_UPDATED, {
      resourceId: entry._id,
      resourceType: "password",
      metadata: { site: entry.site },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    // ─────────────────────────────────────────────────────────────────────

    res.status(200).json({
      success: true,
      data: { message: "Password updated", password: entry },
    });
  } catch (error) {
    console.error("updatePassword error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating password" });
  }
};

// @route   DELETE /api/passwords/:id
// @access  Private
const deletePassword = async (req, res) => {
  try {
    const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ success: false, message: "Password entry not found" });
    }

    // Entry removed — cached list must be invalidated
    await invalidateCache(allPasswordsKey(req.user.id));

    // ── Background jobs (non-blocking) ────────────────────────────────────
    // await addJob("passwordDeleted", {
    //   userId: req.user.id,
    //   passwordId: entry._id,
    //   site: entry.site,
    //   deletedAt: new Date().toISOString(),
    //   deletedBy: req.user.id,
    // });
    addJob("passwordDeleted", {
      userId: req.user.id,
      passwordId: entry._id,
      site: entry.site,
      deletedAt: new Date().toISOString(),
      deletedBy: req.user.id,
    }).catch((err) => console.error("[Queue] passwordDeleted enqueue failed:", err.message));

    logActivity(req.user.id, ACTIVITY_TYPES.PASSWORD_DELETED, {
      resourceId: entry._id,
      resourceType: "password",
      metadata: { site: entry.site },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    // ─────────────────────────────────────────────────────────────────────

    res.status(200).json({
      success: true,
      data: { message: "Password deleted" },
    });
  } catch (error) {
    console.error("deletePassword error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting password" });
  }
};

module.exports = { getAllPasswords, createPassword, updatePassword, deletePassword };