import mongoose from 'mongoose';
import uriFormat from 'mongodb-uri';
import logger from './logger';

// produce a properly encoded connection string
function encodeMongoURI(urlString) {
  return urlString && uriFormat.format(uriFormat.parse(urlString));
}

// mongoose connection details and configs
export default () => {
  mongoose
    .connect(encodeMongoURI(process.env.MONGO_DB_URI))
    .then(() => {
      logger.info('Connection to database successful!');
    })
    .catch((err) => logger.error(`Error connecting to database: ${err}`));
};
