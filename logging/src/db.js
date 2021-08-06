import mongoose from 'mongoose';
import logger from './logger.js';

// mongoose connection details and configs
export default () => {
  mongoose
    .connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      logger.info('Connection to database successful!');
    })
    .catch((err) => logger.error(`Error connecting to database: ${err}`));
};
