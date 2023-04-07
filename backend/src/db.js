import mongoose from 'mongoose';
import uriFormat from 'mongodb-uri';
import logger from './logger.js';

// get MONGO_DB_URI environment variable
const mongoDBURI = process.env.MONGO_DB_URI;

// check if MONGO_DB_URI environment variable exists
if (!mongoDBURI) {
  throw new TypeError('MONGO_DB_URI environment variable must be provided!');
}

// produce a properly encoded connection string
const encodeMongoURI = (urlString) => urlString && uriFormat.format(uriFormat.parse(urlString));

// mongoose connection details and configs
export default {
  connect: () => mongoose
    .connect(encodeMongoURI(mongoDBURI))
    .then(() => {
      logger.info('Connection to database successful!');
    })
    .catch((err) => logger.error(`Error connecting to database: ${err}`)),
  disconnect: () => mongoose.disconnect(),
};
