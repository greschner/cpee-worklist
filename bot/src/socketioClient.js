import { io } from 'socket.io-client';
import { baseURL, socketPath } from './config.js';
import logger from './logger.js';
import { logMessage } from './bot.js';

const socket = io(baseURL, { path: socketPath });

socket.on('connect', () => {
  logger.info(`Connected: ${socket.id}`);
});

socket.on('disconnect', (reason) => {
  logger.info(`Disconnected: ${reason}`);
  if (reason === 'io server disconnect') {
    // disconnect initiated by server. Manually reconnect
    socket.connect();
  }
});

socket.on('connect_error', (err) => {
  logger.info(`Connect error: ${err.message}`);
});

socket.on('message', ({ message, level }) => {
  if (!message) {
    logger.warn('Message property undefined');
    return;
  }
  logMessage(message, level);
  logger.info({ LEVEL: level, message });
});

export default socket;
