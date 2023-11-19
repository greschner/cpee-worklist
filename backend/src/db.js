import mongoose from 'mongoose';
import uriFormat from 'mongodb-uri';
import logger from './logger.js';

// get MONGO_DB_URI environment variable
const mongoURI = process.env.MONGO_DB_URI;

// check if MONGO_DB_URI environment variable exists
if (!mongoURI) {
  throw new TypeError('MONGO_DB_URI environment variable must be provided!');
}

// produce a properly encoded connection string
const encodeMongoURI = (urlString) => urlString && uriFormat.format(uriFormat.parse(urlString));

// Connect to database using by mongoURI
const connect = async () => {
  try {
    await mongoose.connect(encodeMongoURI(mongoURI));
    logger.info('Connection to database successful!');
  } catch (err) {
    logger.error(`Error connecting to database: ${err}`);
  }
};

// Disconnect to database. Runs .close() on all connections in parallel.
const disconnect = async () => {
  if (mongoose.connection.readyState) {
    try {
      await mongoose.disconnect();
      logger.info('Disconnection from database successful!');
    } catch (err) {
      logger.error(`Error disconnecting from database: ${err}`);
    }
  }
};

export default { connect, disconnect };
