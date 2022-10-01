import { io } from 'socket.io-client';
import { baseURL } from './config';
import logger from './logger';
import { logMessage } from './bot';

const socket = io(baseURL, { path: '/backend/socket.io' });

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
