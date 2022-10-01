import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import logger from './logger';

// create server
const server = createServer(app);
const io = new Server(server, { transports: ['websocket'] });

io.on('connection', (socket) => {
  logger.info(`Connected: ${socket.id}`);
  socket.on('disconnect', (reason) => {
    logger.info(`Disconnected: ${reason}`);
  });
});

export { server, io };
