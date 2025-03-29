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
      db: "mongodb+srv://hadiyhadiy2008:fIu8XNAtpKPJ6d0E@cluster0.6xf2s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      options: { useUnifiedTopology: true },
      collection: "logger",
    }),
  ],
});

module.exports = logger;
