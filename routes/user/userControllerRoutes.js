const express = require("express");
const router = express.Router();

/**
 * User Controller Methods
 * Handles all user-related operations including authentication and account management
 */
const userController = require("../../controllers/user/userController");

/**
 * Authentication Routes
 * Handles user registration, login, and session management
 */
router.post("/auth/signup", userController.userSignUp);
router.post("/auth/signin", userController.userSignIn);
router.delete("/auth/logout/:token", userController.userActivityLogout);

/**
 * Session Management Routes
 * Handles user session verification and activity tracking
 */
router.get(
  "/session/activity/:token/:user_id?",
  userController.checkUsersLoggedActivity
);

/**
 * Password Management Routes
 * Handles password recovery and reset functionality
 */
router.post("/password/forget", userController.userForgetPassword);
router.post("/password/reset", userController.userResetPassword);

module.exports = router;
