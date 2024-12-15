const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    user_role: {
      type: String,
      default: null,
    },
    firstname: {
      type: String,
      default: null,
    },
    lastname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      default: null,
    },
    email_verification: {
      type: Boolean,
      default: false,
    },
    profile_image: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: null,
    },
    access_token: {
      type: String,
      default: null,
    },
    creation_date: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: String,
      default: null,
    },
    last_login: {
      type: String,
      default: null,
    },
    last_login_ip_address: {
      type: String,
      default: null,
    },
  },
  {
    collection: "users_test",
  }
);

// export Users
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
