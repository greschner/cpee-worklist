// created with lots of love by Jan André Greschner
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import createError from 'http-errors';
import cors from 'cors';
import logger from './logger.js';
import receiveRoutes from './routes/receive.js';
import db from './db.js';

// set listening port
const PORT = process.env.PORT || 4000;

// connect to database
db();

// create object of express module
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  logger.info('connected');
  io.set('transports', ['websocket']);

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
const a = receiveRoutes(io);
app.use('/', a);

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
server.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});
