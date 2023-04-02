import mongoose from 'mongoose';
import uriFormat from 'mongodb-uri';
import logger from './logger.js';

// produce a properly encoded connection string
const encodeMongoURI = (urlString) => urlString && uriFormat.format(uriFormat.parse(urlString));

// mongoose connection details and configs
export default {
  connect: () => mongoose
    .connect(encodeMongoURI(process.env.MONGO_DB_URI))
    .then(() => {
      logger.info('Connection to database successful!');
    })
    .catch((err) => logger.error(`Error connecting to database: ${err}`)),
  disconnect: () => mongoose.disconnect(),
};
