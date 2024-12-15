const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Logs
const logger = require("../../logger");

// Libraries
const {
  generateAccessToken,
  accessToken,
  updateUserActivity,
} = require("../../library/utils");

// Models
const Users = require("../../models/home/usersModel");
const UsersLoggedActivity = require("../../models/user/usersLoggedActivityModel");

//Post User SignUp :
//Route: POST /api/users-signup
//Access: public
const userSignUp = asyncHandler(async (req, res) => {
  try {
    const { firstname, lastname, mobile, email, password } = req.body;
    const errors = [];
    if (!firstname || !lastname || !mobile || !email || !password) {
      errors.push("Merci de remplir tous les champs.");
      logger.info(
        `Sign up failed - Missing fields: ${JSON.stringify(req.body)}`
      );
    }
    if (!/^\d+$/.test(mobile) || mobile.length < 10 || mobile.length > 10) {
      errors.push("Veuillez renseigner un numéro de téléphone valide.");
      logger.info(`Sign up failed - Invalid mobile: ${mobile}`);
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push("Veuillez renseigner une adresse email valide.");
      logger.info(`Sign up failed - Invalid email: ${email}`);
    }
    if (errors.length > 0) {
      return res
        .status(200)
        .json({ error: true, status: 400, message: errors });
    }
    const user = await Users.findOne({ email });
    if (user) {
      logger.info(`Sign up attempt with existing email: ${email}`);
      return res
        .status(200)
        .json({ error: true, status: 400, message: "L'email existe déjà." });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const newUser = new Users({
        email,
        mobile,
        password: hashedPassword,
        firstname,
        lastname,
        // access_token,
        user_role: "normal_user",
      });
      const savedUser = await newUser.save();
      if (savedUser) {
        logger.info(`New user created: ${savedUser.email}`);
        const token = await generateAccessToken(savedUser);
        const updatedUsersData = await Users.findOneAndUpdate(
          { email },
          { $set: { token: token } },
          { new: true }
        );
        await updateUserActivity(savedUser, token);
        return res.status(200).json({
          error: false,
          status: 200,
          message: "Utilisateur enregistré avec succès",
          response: updatedUsersData,
        });
      } else {
        logger.error(`Failed to save new user: ${email}`);
        return res.status(200).json({
          error: true,
          status: 400,
          message: "Impossible de s'inscrire.",
        });
      }
    }
  } catch (err) {
    logger.error(`An error occurred : userSignUp`, err);
    throw new Error("An error occurred : userSignUp", err);
  }
});

//Post User SignIn :
//Route: POST /api/users-signin
//Access: public
const userSignIn = asyncHandler(async (req, res) => {
  try {
    const { type, firstname, lastname, mobile, email, password } = req.body;
    const user = await Users.findOne({ email });
    if (type) {
      if (!user) {
        const newUser = new Users({
          email,
          mobile: mobile || null,
          firstname,
          lastname,
          status: 1,
          user_role: "normal_user",
        });
        const savedUser = await newUser.save();
        if (savedUser) {
          const token = await generateAccessToken(savedUser);
          await Users.updateOne({ email }, { $set: { token: token } });
          await updateUserActivity(savedUser, token);

          savedUser.token = token;
          return res.status(200).json({
            error: false,
            status: 200,
            message: "L'utilisateur s'est connecté avec succès.",
            response: savedUser,
          });
        }
      } else {
        const token = await generateAccessToken(user);
        await Users.updateOne({ email }, { $set: { token: token } });
        user.token = token;
        await updateUserActivity(user, token);
        return res.status(200).json({
          error: false,
          status: 200,
          message: "L'utilisateur s'est connecté avec succès.",
          response: user,
        });
      }
    } else {
      if (!(email && password)) {
        logger.info(`Sign-in failed: Missing email or password for ${email}`);
        return res.status(200).json({
          error: true,
          status: 400,
          message: "Tous les champs sont requis.",
        });
      }
      if (!user) {
        logger.info(`Sign-in failed: Email not found for ${email}`);
        return res.status(200).json({
          error: true,
          status: 400,
          message: "L'e-mail n'existe pas.",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.info(`Sign-in failed: Incorrect password for ${email}`);
        return res.status(200).json({
          error: true,
          status: 400,
          message: "Mot de passe incorrect.",
        });
      }
      const token = await generateAccessToken(user);
      await updateUserActivity(user, token);
      user.token = token;

      return res.status(200).json({
        error: false,
        status: 200,
        message: "L'utilisateur s'est connecté avec succès.",
        response: user,
      });
    }
  } catch (err) {
    logger.error("An error occurred in user singin:", err);
    throw new Error("An error occurred in user singin:", err);
  }
});

//Post User Forget-Password :
//Route: POST /api/users-forget-password
//Access: public
const userForgetPassword = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    logger.info(`Password reset request initiated for email: ${email}`);
    const user = await Users.findOne({ email: email });
    if (!user) {
      logger.info(`Password reset failed - No user found with email: ${email}`);
      return res.status(200).json({
        error: true,
        status: 400,
        message: "L'e-mail n'existe pas.",
      });
    } else {
      const access_token = await accessToken();
      logger.info(`Access token generated for email: ${email}`);
      await Users.updateOne(
        { email },
        { $set: { access_token: access_token } }
      );

      return res.status(200).json({
        error: false,
        status: 200,
        message:
          "Le lien de réinitialisation du mot de passe a été envoyé avec succès sur votre e-mail.",
      });
    }
  } catch (err) {
    logger.error("An error occurred in userForgetPassword :", err);
    throw new Error("An error occurred in userForgetPassword :", err);
  }
});

//Post User reset-Password :
//Route: POST /api/users-reset-password
//Access: public
const userResetPassword = asyncHandler(async (req, res) => {
  try {
    const { access_token, password, confirmPassword } = req.body;
    const errors = [];
    if (!(password && confirmPassword)) {
      errors.push("Merci de remplir tous les champs.");
      logger.info("Password reset failed - Missing password fields");
    }
    if (password !== confirmPassword) {
      errors.push("Le mot de passe ne correspond pas.");
      logger.info("Password reset failed - Passwords do not match");
    }
    if (!access_token) {
      errors.push("Jeton introuvable.");
      logger.info("Password reset failed - Access token missing");
    }
    if (errors.length > 0) {
      return res
        .status(200)
        .json({ error: true, status: 400, message: errors });
    }
    const userExist = await Users.findOne({ access_token });
    if (userExist) {
      logger.info(`Password reset in progress for user: ${userExist.email}`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const user = await Users.findOneAndUpdate(
        { access_token },
        { $set: { password: hashedPassword, access_token: null } }
      );
      if (!user) {
        logger.error(
          `Password reset failed - Could not update password for user: ${userExist.email}`
        );
        return res.status(200).json({
          error: false,
          status: 400,
          message: "Impossible de réinitialiser le mot de passe.",
        });
      } else {
        return res.status(200).json({
          error: false,
          status: 200,
          message: "Le mot de passe a été réinitialisé avec succès.",
        });
      }
    } else {
      logger.info(`Password reset failed - Invalid token: ${access_token}`);
      return res.status(200).json({
        error: false,
        status: 404,
        message: "Jeton invalide",
      });
    }
  } catch (err) {
    logger.error("An error occurred in userResetPassword :", err);
    throw new Error("An error occurred in userResetPassword :", err);
  }
});

// Check loggged in user's activity :
// Route: GET /api/check-users-logged-activity/:token
// Access: public
const checkUsersLoggedActivity = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;
    if (token) {
      logger.info(`Checking activity for token: ${token}`);
      const result = await Users.aggregate([
        {
          $match: { token },
        },
        {
          $lookup: {
            from: "users_logged_activity",
            localField: "token",
            foreignField: "token",
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
          logger.info(`Active session found for user with token: ${token}`);
          return res.status(200).json({
            error: false,
            status: 200,
            message: "L'utilisateur connecté est toujours actif.",
            response: user,
          });
        }
      }
      logger.info(`Token expired or invalid: ${token}`);
      return res.status(200).json({
        error: true,
        status: 401,
        message: "Le jeton a expiré",
      });
    } else {
      logger.info("Token not found in request.");
      return res.status(200).json({
        error: true,
        status: 404,
        message: "Jeton non trouvé.",
      });
    }
  } catch (err) {
    logger.error(
      `An error occurred in checkUsersLoggedActivity :${req.params.token}`,
      err
    );
    throw new Error("An error occurred : checkUsersLoggedActivity", err);
  }
});

// Logout users activity/session
// Route: GET /api/logout-users-activity/:token
// Access: public
const userActivityLogout = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;
    if (token) {
      const activity = await UsersLoggedActivity.findOne({ token: token });
      if (activity) {
        logger.info(`User found with token: ${token}`);
        const deleted = await UsersLoggedActivity.deleteOne({
          token: token,
        });
        if (deleted) {
          logger.info(`User with token ${token} logged out successfully`);
          return res.status(200).json({
            error: false,
            status: 200,
            message: "Déconnecté avec succès",
          });
        } else {
          logger.error(`Failed to delete user activity for token: ${token}`);
          return res.status(200).json({
            error: false,
            status: 403,
            message: "Impossible de déconnecter l'utilisateur!",
          });
        }
      } else {
        logger.info(`Logout attempt with expired token: ${token}`);
        return res.status(200).json({
          error: false,
          status: 401,
          message: "Jeton déjà expiré!",
        });
      }
    } else {
      logger.info("Logout attempt with missing token");
      return res.status(200).json({
        error: true,
        status: 404,
        message: "Jeton introuvable!",
      });
    }
  } catch (err) {
    logger.error(`An error occurred during logout: ${err}`, {
      error: err,
    });
    logger.error("An error occurred : userActivityLogout", err);
    throw new Error("An error occurred : userActivityLogout", err);
  }
});

// Export
module.exports = {
  userSignUp,
  userSignIn,
  userForgetPassword,
  userResetPassword,
  checkUsersLoggedActivity,
  userActivityLogout,
};
