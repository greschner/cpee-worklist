import EventSource from 'eventsource';
import { sseClient } from './config';
import logger from './logger';
import { logMessage } from './bot';

const evtSource = new EventSource(sseClient);

evtSource.onopen = () => {
  logger.info('The SSE connection has been established.');
};

evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  logger.info(data, 'SSE Data object:');
  if (!data.message) {
    logger.warn('Message property undefined');
    return;
  }
  logMessage(data.message, data.level);
};

evtSource.onerror = (error) => {
  logger.error(error, 'An error occurred while attempting to connect:');
};

evtSource.addEventListener('test', (event) => {
  const data = JSON.parse(event.data);
  if (!data.message) {
    logger.warn('Message property undefined');
    return;
  }
  logMessage(data.message, data.level);
  logger.info(data);
});

export default evtSource;
