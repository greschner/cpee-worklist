import express from 'express';
import axios from 'axios';
import { taskModel } from '../model';
import logger from '../logger';
import { idValidation } from '../middleware';

const router = express.Router();

// middlerware to validate the id
const valID = idValidation((req) => taskModel.findById(req.params.id));

let clients = [];

const sendEventsToAll = (data, event) => {
  clients.forEach((client) => client.res.write(`${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`));
};

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.post('/receive', async (req, res, next) => {
  try {
    const task = await taskModel.create({
      label: req.headers['cpee-label'],
      pid: req.body.pid,
      activity: req.headers['cpee-activity'],
      callback: req.headers['cpee-callback'],
      callbackId: req.headers['cpee-callback-id'],
      instance: req.headers['cpee-instance'],
      instanceUuid: req.headers['cpee-instance-uuid'],
      instanceUrl: req.headers['cpee-instance-url'],
      body: req.body,
    });
    logger.info(`New Task created: ${task}`);
    sendEventsToAll(task, 'add');
    res.set('CPEE-CALLBACK', 'true').sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.get('/96plates', async (req, res, next) => {
  try {
    res.json({ count: randomInteger(0, 4) });
  } catch (error) {
    next(error);
  }
});

router.get('/', async ({ query: { id } }, res, next) => {
  try {
    const q = { // query object
      ...id && { pid: { $in: Array.isArray(id) ? id : [id] } }, // filter after pid
    };
    const tasks = await taskModel.find(q).sort({ timestamp: -1 }).exec() || [];
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/tasks/:id', valID, async (req, res) => {
  res.json(req.result);
});

router.put('/tasks/:id', valID, async (req, res, next) => {
  try {
    logger.info('Send PUT request');
    logger.info(`Callback-URL: ${req.result.callback}`);
    logger.info(`Body: ${req.body}`);
    await axios.put(req.result.callback, req.body);
    await taskModel.findByIdAndDelete(req.result._id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
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

export default router;
