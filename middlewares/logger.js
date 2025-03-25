const winston = require("winston");
require("winston-mongodb");

const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  defaultMeta: {
    service: "user-service",
  },
  transports: [
    new winston.transports.File({ filename: "logger.log", level: "error" }),
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      db: "mongodb://localhost:27017/logger",
      options: { useUnifiedTopology: true },
      collection: "logger",
    }),
  ],
});

module.exports = logger;
