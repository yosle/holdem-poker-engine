import winston from "winston";

export const createLogger = (tableId: string) =>
  winston.createLogger({
    level: "debug",
    // defaultMeta: { gameId }, // Asignar el gameId como metadata por defecto
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        ({ level, message, timestamp, gameId, ...meta }) => {
          return `${timestamp} [${level}] (gameId: ${
            tableId || "N/A"
          }): ${message} ${JSON.stringify(meta)}`;
        }
      )
    ),
    transports: [
      new winston.transports.Console(),
      // new winston.transports.File({ filename: "logs/combined.log" }),
    ],
  });
