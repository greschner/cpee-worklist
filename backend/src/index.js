// created with lots of love by Jan André Greschner
import express from 'express';
import createError from 'http-errors';
import logger from './logger.js';
import receiveRoutes from './routes/receive.js';

// set listening port
const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());

// routes
app.use('/', receiveRoutes);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// listen on port
app.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});
