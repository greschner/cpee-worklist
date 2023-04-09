import express from 'express';
import createError from 'http-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import pinoHttp from 'pino-http';
import { receiveRoute, correlatorRoute, servicesRoute } from './routes/index.js';

// create object of express module
const app = express();

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup cors
app.use(cors());

// http logger
app.use(pinoHttp());

// routes
app.use('/', receiveRoute);
app.use('/corr', correlatorRoute);
app.use('/services', servicesRoute);

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
      console.error(err);
      break;
  }
  console.log(err);
  res.status(error.status || 500).json({ error: error.message });
});

export default app;
