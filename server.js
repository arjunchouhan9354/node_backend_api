const express = require("express");
var bodyParser = require("body-parser");
const upload = require("express-fileupload");
const cors = require("cors");
const http = require("http");

// Import methods
require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const logger = require("./logger");
const compression = require("compression");
const { initSocket } = require("./config/socket");

// Express server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
initSocket(server);

// Enable compression middleware
app.use(compression());

// Cors Origin options
const corsOptions = {
  origin: "*",
};

// Cors origin allow
app.use(cors(corsOptions));

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(upload());

// For public folder serve static files
app.use(express.static("public"));

// Running Port
const port = process.env.PORT || 5000;

// DB Connection
connectDb();

// express json
app.use(express.json());

/* ==============| API Routes |=================*/

// User controller routes
app.use("/api", require("./routes/user/userControllerRoutes"));

// Error handler
app.use(errorHandler);

// Listen server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  logger.info(`Server running on port ${port}`);
});
