import winston from "winston";

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize(), // Colorize logs in console
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Custom timestamp
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});
