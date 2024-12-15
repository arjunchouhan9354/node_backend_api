const { constants } = require("../constants");
const logger = require("../logger");

// Error Handler function
const errorHandler = (err, req, res, next) => {
  // Get status code
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Check the cases
  switch (statusCode) {
    // VALIDATION_ERROR: 400
    case constants.VALIDATION_ERROR:
      res.status(constants.VALIDATION_ERROR).json({
        title: "Validation Failed",
        status: constants.VALIDATION_ERROR,
        message: err.message,
        stackTrace: err.stack,
      });
      logger.error({
        title: "Validation Failed",
        status: constants.VALIDATION_ERROR,
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    // NOT_FOUND: 404
    case constants.NOT_FOUND:
      res.status(constants.NOT_FOUND).json({
        title: "Not Found",
        status: constants.NOT_FOUND,
        message: err.message,
        stackTrace: err.stack,
      });
      logger.error({
        title: "Not Found",
        status: constants.NOT_FOUND,
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    // UNAUTHORIZED: 401
    case constants.UNAUTHORIZED:
      res.status(constants.UNAUTHORIZED).json({
        title: "Unauthorized",
        status: constants.UNAUTHORIZED,
        message: err.message,
        stackTrace: err.stack,
      });
      logger.error({
        title: "Unauthorized",
        status: constants.UNAUTHORIZED,
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    // FORBIDDEN: 403
    case constants.FORBIDDEN:
      res.status(constants.FORBIDDEN).json({
        title: "Forbidden",
        status: constants.FORBIDDEN,
        message: err.message,
        stackTrace: err.stack,
      });
      logger.error({
        title: "Forbidden",
        status: constants.FORBIDDEN,
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    // SERVER_ERROR: 500
    case constants.SERVER_ERROR:
      res.status(constants.SERVER_ERROR).json({
        title: "Server Error",
        status: constants.SERVER_ERROR,
        message: err.message,
        stackTrace: err.stack,
      });
      logger.error({
        title: "Server Error",
        status: constants.SERVER_ERROR,
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    default:
      // Handle other status codes here
      res.status(500).json({
        title: "Error occurred",
        status: 500,
        message: err.message,
        stackTrace: err.stack,
      });
      logger.error({
        title: "Error occurred",
        status: 500,
        message: err.message,
        stackTrace: err.stack,
      });
      break;
  }
};

// Export handler
module.exports = errorHandler;
