// created with lots of love by Jan André Greschner
import express from 'express';
import createError from 'http-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import logger from './logger';
import { receiveRoute, correlatorRoute } from './routes';
import db from './db';

// set listening port
const PORT = process.env.PORT || 4000;

// connect to database
db();

// create object of express module
const app = express();

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup cors
app.use(cors());

// routes
app.use('/', receiveRoute);
app.use('/corr', correlatorRoute);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let error = null;

  switch (true) {
    case err instanceof createError.HttpError:
      error = err;
      break;
    case err instanceof mongoose.Error.DocumentNotFoundError:
      error = createError.NotFound(`Cannot not find: ${error.filter}`);
      break;
    case err instanceof mongoose.Error.CastError:
      error = createError.BadRequest('ID must be a string of 12 bytes or a string of 24 hex characters');
      break;
    default:
      error = createError.InternalServerError();
      break;
  }
  console.log('tetetetetette');
  // logger.error(err);
  console.error(err);
  res.status(error.status || 500).json({ error: error.message });
});

// listen on port
app.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});

const t = (update = false) => {
  const k = {
    headers: {
      ...update && { 'cpee-update': true },
    },
  };
  console.log(k);
};

t();
t(true);
