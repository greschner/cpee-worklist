// created with lots of love by Jan André Greschner
import express from 'express';
import createError from 'http-errors';
import logger from './logger.js';
import receiveRoutes from './routes/receive.js';
import db from './db.js';

// set listening port
const PORT = process.env.PORT || 4000;

// connect to database
db();

// create object of express module
const app = express();

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/', receiveRoutes);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

// listen on port
app.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});
