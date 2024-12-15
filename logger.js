const { createLogger, transports, format } = require("winston");
require("winston-daily-rotate-file");
const { combine, timestamp } = format;

const logDir = "logs";

const transport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = createLogger({
  level: "debug",
  format: combine(timestamp(), format.json()),
  transports: [transport],
});

// error logger
module.exports = logger;
