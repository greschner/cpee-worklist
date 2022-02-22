import express from 'express';
import { taskModel, producedModel } from '../model';
import logger from '../logger';
import { callbackInstance } from '../utils/cpee';
import { schemaValidation } from '../middleware';
import { taskSchema } from '../schemata';

const router = express.Router();

let clients = [];

const sendEventsToAll = (data, event) => {
  clients.forEach((client) => client.res.write(`${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`));
};

const matchTask = (pid, body) => {
  switch (pid) {
    case '2':
    case '4':
    case '5':
    case '7':
      return producedModel.findOne({ pid, 'body.plateid': body.plateid });
    case '3':
      return producedModel.findOne({ pid, 'body.sampleid': body.sampleid });
    default:
      return producedModel.findOne({ pid });
  }
};

router.post('/', schemaValidation(taskSchema.POST, 'body'), async (req, res, next) => {
  try {
    // const xml = await readFile('/Users/jangreschner/dockerProjects/labMaster/logging/test_sub.xml', { encoding: 'utf8' });

    // cpee callback request
    if (req.headers['cpee-callback']) {
      const { pid, ...body } = req.body;
      const task = await taskModel.create({
        label: req.headers['cpee-label'],
        pid,
        activity: req.headers['cpee-activity'],
        callback: req.headers['cpee-callback'],
        callbackId: req.headers['cpee-callback-id'],
        instance: req.headers['cpee-instance'],
        instanceUuid: req.headers['cpee-instance-uuid'],
        instanceUrl: req.headers['cpee-instance-url'],
        body,
      });
      logger.info(`New Task created: ${task}`);
      sendEventsToAll(task, 'add');
      res.setHeader('CPEE-CALLBACK', 'true');
    }
    const tempArr = ['1', '2']; // debug only temporary
    // producer
    if (req.headers['content-id'] === 'producer' && tempArr.includes(req.body.pid)) {
      const t = await producedModel.create(req.body);
      logger.info(`New produced Task created: ${t}`);
    }
  } catch (error) {
    next(error);
  }
  next();
});

// correlator
router.all('/', async (_req, res, next) => {
  try {
    const openTasks = await taskModel.find({});
    await Promise.all(openTasks.map(async ({
      pid, callback, _id: id, body,
    }) => {
      const producedTask = await matchTask(pid, body); // match TODO
      console.log(`MATCH: ${producedTask}`);
      if (producedTask) {
        await callbackInstance(callback, producedTask.body); // callback to CPEE
        await Promise.all([
          taskModel.findByIdAndDelete(id), // remove from task list
          producedModel.findByIdAndDelete(producedTask._id), // remove from produced list
        ]);
        sendEventsToAll(id, 'remove');
      }
    }));
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

/* router.post('/t', schemaValidation(taskSchema.POST, 'body'), (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
}); */

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
