const mongoose = require("mongoose");

// users logged activity schema
const usersLoggedActivitySchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user_role: {
      type: String,
      default: "normal_user",
    },
    user_id: {
      type: String,
      default: null,
    },
    activityTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiration: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 24 * 1000),
    },
  },
  { collection: "users_logged_activity" }
);

// Set TTL (Time-To-Live) index to automatically expire documents after 5 minutes
usersLoggedActivitySchema.index(
  { activityTime: 1 },
  { expireAfterSeconds: 86400 }
);

// Users Logged Acitivity
const UsersLoggedActivity = mongoose.model(
  "UsersLoggedActivity",
  usersLoggedActivitySchema
);

// Export model
module.exports = UsersLoggedActivity;
