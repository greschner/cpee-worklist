// created with lots of love by Jan André Greschner
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import createError from 'http-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import logger from './logger';
import { receiveRoute } from './routes';
import db from './db';

// set listening port
const PORT = process.env.PORT || 4000;

// connect to database
db();

// create object of express module
const app = express();
const server = createServer(app);

const io = new Server(server, {
  perMessageDeflate: false,
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  logger.info('connected');
  socket.on('disconnect', () => {
    logger.info('client disconnected');
  });
});

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup cors
app.use(cors());

// routes
const a = receiveRoute(io);
app.use('/', a);

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

  console.error(err);
  res.status(error.status || 500).json({ error: error.message });
});

// listen on port
server.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});
