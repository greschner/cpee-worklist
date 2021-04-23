import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const myFormat = winston.format.printf(({
  level, message, timestamp,
}) => `[${timestamp}] ${level}: ${message}`);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.align(),
        winston.format.timestamp({
          format: 'DD.MM.YYYY HH:mm:ss',
        }),
        myFormat,
      ),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/app.log',
    maxsize: 1048576,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }));
}

export default logger;
