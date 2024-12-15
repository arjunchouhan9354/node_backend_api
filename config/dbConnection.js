const mongoose = require("mongoose");
const logger = require("../logger");

// MongoDB connection
const connectDb = async () => {
  try {
    // Connect to the mongoDB
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    // Message
    console.log(
      "Database connected: ",
      connect.connection.host,
      connect.connection.name
    );
    // Logs
    logger.info(
      `Database connected: ${connect.connection.host}, ${connect.connection.name}`
    );
  } catch (err) {
    // Message and logs
    console.log(err);
    logger.error(err);
    process.exit(1);
  }
};
// Export connectDb function
module.exports = connectDb;
