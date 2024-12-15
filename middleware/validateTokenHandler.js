const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Users = require("../models/home/usersModel");

// Validate Token : Authentication for access
const validateToken = asyncHandler(async (req, res, next) => {
  let token;

  // Get Token form the headers
  let authHeader = req.headers.Authorization || req.headers.authorization;

  // Check if Authorization token exist or not
  if (authHeader != undefined) {
    if (authHeader && authHeader.startsWith("Bearer")) {
      // Get token form the bearer
      token = authHeader.split(" ")[1];

      if (!token) {
        // Unthorized response
        return res.status(200).json({
          error: true,
          status: 404,
          message: "Le jeton n'est pas autorisé ou le jeton est manquant",
        });
      }

      // Verify token code
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECERT,
        async (err, decoded) => {
          if (err) {
            // Unthorized response
            return res.status(200).json({
              error: true,
              status: 401,
              message: "Le jeton n'est pas autorisé",
            });
          }

          // Check if there is an active session with the token
          // const activity = await UsersLoggedActivity.findOne({ token });
          const result = await Users.aggregate([
            {
              $match: { token },
            },
            {
              $lookup: {
                from: "users_logged_activity", // Name of the UsersLoggedActivity collection
                localField: "token", // Field in Users collection
                foreignField: "token", // Field in UsersLoggedActivity collection
                as: "activity",
              },
            },
            {
              $unwind: {
                path: "$activity",
                preserveNullAndEmptyArrays: true, // Keep users even if no matching activity
              },
            },
          ]);

          if (result.length > 0) {
            const user = result[0];
            if (user.activity) {
              // Docoded user data
              req.data = decoded.data;
              next();
            } else {
              // Unthorized response
              return res.status(200).json({
                error: true,
                status: 401,
                message: "Le jeton a expiré",
              });
            }
          } else {
            // Unthorized response
            return res.status(200).json({
              error: true,
              status: 401,
              message: "Le jeton a expiré",
            });
          }
        }
      );
    } else {
      // Unthorized response
      return res.status(200).json({
        error: true,
        status: 404,
        message: "Jeton d'autorisation vide",
      });
    }
  } else {
    // Unthorized response
    return res.status(200).json({
      error: true,
      status: 404,
      message: "Jeton d'autorisation vide",
    });
  }
});

module.exports = validateToken;
