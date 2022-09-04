import express from 'express';
import axios from 'axios';
import logger from '../logger';
import { schemaValidation } from '../middleware';
import { serviceSchema } from '../schemata';
import { getVisitLinkURL } from '../utils/cpee';

const router = express.Router();

let clients = [];

const SSEsendEventsToAll = (data, event) => {
  clients.forEach((client) => client.res.write(`${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`));
};

const dateDiffinHours = (a, b) => (a - b) / (1000 * 60 * 60);

router.post('/pcheck', (req, res) => {
  console.log(req.body);
  const { createdids } = req.body;
  const { finishids } = req.body;
  // difference between createdids and finishids
  const unfinishedPlates = createdids.filter(
    ({ plateid: pid1 }) => !finishids.some(({ plateid: pid2 }) => pid1 === pid2),
  );
  const okPlates = unfinishedPlates.filter(
    ({ timestamp, plateid, 'CPEE-INSTANCE-URL': bar }) => {
      const hoursDiff = dateDiffinHours(new Date(), new Date(timestamp));
      const ok = hoursDiff < 4;
      if (!ok) {
        logger.warn(`Bad Plate: ${plateid} with delta: ${hoursDiff.toFixed(2)} h. Link: ${getVisitLinkURL(bar)}`);
        SSEsendEventsToAll({
          level: 'WARN',
          message: `Bad Plate found: [${plateid}](${getVisitLinkURL(bar)}) with delta: ${hoursDiff.toFixed(2)} h`,
        });
      }
      return ok;
    },
  );
  logger.info(unfinishedPlates);
  res.json(okPlates);
});

router.post('/notifyall', schemaValidation(serviceSchema.POST_NOTIFYALL, 'body'), (req, res) => {
  const { event, level, message } = req.body;
  logger.info(req.body, 'POST /notifyall:');
  SSEsendEventsToAll({ level, message }, event);
  res.sendStatus(200);
});

router.post('/timeout', schemaValidation(serviceSchema.POST_TIMEOUT, 'body'), (req, res) => {
  logger.info(req.body, 'POST /timeout');
  const { duration } = req.body;

  const timeout = setTimeout(() => {
    logger.info(`Timeout callback to instance: ${req.headers['cpee-instance']}`);
    axios.put(req.headers['cpee-callback'], 'nil', { 'Content-Type': 'text/plain' }).catch((error) => { console.error(error); });
  }, parseInt(duration, 10) * 1000);

  res.set('CPEE-CALLBACK', 'true').sendStatus(200);
});

router.get('/sse', (req, res) => {
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });

  const id = Date.now();

  const newClient = {
    id,
    res,
  };

  clients.push(newClient);

  req.on('close', () => {
    logger.info(`${id} Connection closed`);
    clients = clients.filter((client) => client.id !== id);
  });
});

export { SSEsendEventsToAll };
export default router;
