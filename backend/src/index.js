// created with lots of love by Jan André Greschner
import db from './db';
import app from './app';
import logger from './logger';
// import { abandonInstances } from './utils/cpee';

// connect to database
db.connect();

// set listening port
const PORT = process.env.PORT || 4000;

// listen on port
const server = app.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});

const gracefulStop = (signal) => {
  logger.info(`${signal} signal received. Shutting down...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    db.disconnect().then(() => {
      process.exit();
    });
  });
};

// Enable graceful stop
process.once('SIGINT', gracefulStop);
process.once('SIGTERM', gracefulStop);

// abandonInstances(6084, 6101);
