// created with lots of ❤️ by Jan André Greschner
import db from './db.js';
import logger from './logger.js';
import { server, io } from './socket.js';

// connect to database
db.connect();

// set listening port
const PORT = process.env.PORT || 4000;

// listen on port
server.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});

const gracefulStop = (signal) => {
  logger.info(`${signal} signal received. Shutting down...`);
  io.close(async () => {
    logger.info('HTTP and socket server closed.');
    await db.disconnect();
    process.exit();
  });
};

// enable graceful stop
process.once('SIGINT', gracefulStop);
process.once('SIGTERM', gracefulStop);
