const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const { getSocket } = require("../config/socket");
const jwt = require("jsonwebtoken");
const UsersLoggedActivity = require("../models/user/usersLoggedActivityModel");

/**
 * Emits a real-time notification to a specific user via Socket.IO
 * @param {string} userId - The ID of the user to receive the notification
 * @param {string} message - The notification message
 * @param {Object} data - Additional data to be sent with the notification
 */
function emitNotification(userId, message, data = {}) {
  try {
    const io = getSocket();
    const roomId = String(userId);

    if (!io) {
      logger.error("Socket.IO instance is not available");
      return;
    }

    const notification = {
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Add small delay to ensure room connection
    setTimeout(() => {
      if (io.sockets.adapter.rooms.has(roomId)) {
        io.to(roomId).emit("new_notification", notification);
      } else {
        logger.warn(`Room for user ${roomId} does not exist`);
      }
    }, 100);
  } catch (error) {
    logger.error("Error emitting notification:", error);
  }
}

/**
 * Generates a random access token string
 * @returns {Promise<string>} A 32-character random token
 */
const accessToken = asyncHandler(async () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const tokenLength = 32;
  let token = "";

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
});

/**
 * Updates or creates a user's activity record in the database
 * @param {Object} user - User object containing _id and user_role
 * @param {string} token - Authentication token
 * @throws {Error} If database operations fail
 */
const updateUserActivity = async (user, token) => {
  try {
    const userId = user._id.toString();
    const activityData = {
      token,
      user_role: user.user_role,
      user_id: userId,
    };

    await UsersLoggedActivity.findOneAndDelete({ user_id: userId });
    await UsersLoggedActivity.create(activityData);
  } catch (error) {
    logger.error("Error updating user activity:", error);
    throw error;
  }
};

/**
 * Generates a JWT access token for user authentication
 * @param {Object} data - User data to be encoded in the token
 * @returns {Promise<string>} JWT access token
 */
const generateAccessToken = asyncHandler(async (data) => {
  const userData = {
    _id: data._id,
    agence_id: data.agence_id,
    user_role: data.user_role,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    telephone: data.telephone,
  };

  return jwt.sign({ data: userData }, process.env.ACCESS_TOKEN_SECERT, {
    expiresIn: "24h",
  });
});

module.exports = {
  emitNotification,
  accessToken,
  generateAccessToken,
  updateUserActivity,
};
