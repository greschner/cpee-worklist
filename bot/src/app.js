import express from 'express';
import createError from 'http-errors';
import cors from 'cors';
import sse from './sse';

// create object of express module
const app = express();

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup cors
app.use(cors());

// routes
app.use('/sse', sse);

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
    default:
      error = createError.InternalServerError();
      console.error(err);
      break;
  }
  res.status(error.status || 500).json({ error: error.message });
});

export default app;
