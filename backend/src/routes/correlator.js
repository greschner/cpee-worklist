import express from 'express';
import { taskModel, producedModel } from '../model';
import logger from '../logger';
import { callbackInstance } from '../utils/cpee';
import { schemaValidation } from '../middleware';
import { taskSchema } from '../schemata';

const router = express.Router();

let clients = [];

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const sendEventsToAll = (data, event) => {
  clients.forEach((client) => client.res.write(`${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`));
};

const matchTask = (pid, body) => {
  switch (pid) {
    case '3':
    case '4':
    case '5':
    case '7':
      return producedModel.findOne({ pid, 'body.plateid': body.plateid });
    case '6':
    case '8':
    case '9':
      return producedModel.findOne({ pid, 'body.sampleid': body.sampleid });
    case '13':
      return producedModel.findOne({
        pid,
        'body.sampleid': body.sampleid,
        'body.plateid': body.plateid,
        'body.position': body.position,
      });
    default:
      return producedModel.findOne({ pid });
  }
};

// correlator
const correlator = () => {
  taskModel.find({}).then((openTasks) => {
    Promise.all(openTasks.map(async ({
      pid, callback, _id: id, body, label, instance,
    }) => {
      matchTask(pid, body).then((producedTask) => {
        if (producedTask) {
          logger.info(`MATCH Task: ${{
            id, label, pid, instance, body,
          }} with ${producedTask}`);

          const cArr = ['1', '2'].includes(pid);

          if (pid !== '6') {
            producedModel.findByIdAndDelete(producedTask._id).then((producer) => {
              if (producer) {
                Promise.all([
                  callbackInstance(callback, {
                    ...producedTask.body,
                    timestamp: producedTask.timestamp,
                  }, cArr && { 'cpee-update': true }), // callback to CPEE
                  ...!cArr ? [taskModel.findByIdAndDelete(id)] : [], // remove from task list
                ]).catch((error) => {
                  if (error.code === 'ECONNABORTED') {
                    setTimeout(() => {
                      callbackInstance(callback, {
                        ...producedTask.body,
                        timestamp: producedTask.timestamp,
                      }, cArr && { 'cpee-update': true }).catch((e) => { console.error(e); });
                    }, randomIntFromInterval(5, 15) * 1000);
                  }
                  console.error(error);
                });
              }
            }).catch((error) => { console.error(error); });
          } else {
            Promise.all([
              callbackInstance(callback, {
                ...producedTask.body,
                timestamp: producedTask.timestamp,
              }), // callback to CPEE
              taskModel.findByIdAndDelete(id), // remove from task list
            ]).catch((error) => { console.error(error); });
          }

          /* Promise.all([
            callbackInstance(callback, {
              ...producedTask.body,
              timestamp: producedTask.timestamp,
            }, cArr && { 'cpee-update': true }), // callback to CPEE
            ...!cArr ? [taskModel.findByIdAndDelete(id)] : [], // remove from task list
            ...pid !== '6' ? [
              producedModel.findByIdAndDelete(producedTask._id),
            ] : [], // remove from produced list
          ]).catch((error) => { console.error(error); }); */

          sendEventsToAll(id, 'remove'); // sse
        }
      }).catch((error) => { console.error(error); }); // match
    })).catch((error) => { console.error(error); });
  }).catch((error) => { console.error(error); }); // get all open tasks
};

router.post('/', schemaValidation(taskSchema.POST, 'body'), (req, res, next) => {
  try {
    // eslint-disable-next-line max-len
    // const xml = await readFile('/Users/jangreschner/dockerProjects/labMaster/logging/test_sub.xml', { encoding: 'utf8' });

    const { stop } = req.body;

    // cpee callback request
    if (req.headers['cpee-callback'] && !stop) {
      const { pid, ...body } = req.body;
      taskModel.create({
        label: req.headers['cpee-label'],
        pid,
        activity: req.headers['cpee-activity'],
        callback: req.headers['cpee-callback'],
        callbackId: req.headers['cpee-callback-id'],
        instance: req.headers['cpee-instance'],
        instanceUuid: req.headers['cpee-instance-uuid'],
        instanceUrl: req.headers['cpee-instance-url'],
        body,
      }).then((task) => {
        logger.info(`New Task created: ${task}`);
        sendEventsToAll(task, 'add'); // sse
        correlator();
      }).catch((error) => {
        console.error(error);
      }); // save new task to db
      res.setHeader('CPEE-CALLBACK', 'true');
    }

    // producer
    if (req.headers['content-id'] === 'producer') {
      producedModel.create(req.body).then((t) => {
        logger.info(`New produced Task created: ${t}`);
        correlator();
      }).catch((error) => { console.error(error); }); // save new produced entry to db
    }

    // delete task
    if (stop) {
      taskModel.findOneAndDelete({ pid: req.body.pid, instance: req.headers['cpee-instance'] }).then((task) => {
        if (task) {
          logger.info(`Delete Task: ${task}`);
          callbackInstance(task.callback, 'nil', { 'Content-Type': 'text/plain' }).catch((error) => { console.error(error); });
        }
      }).catch((error) => { console.error(error); });
    }
  } catch (error) {
    next(error);
  }
  res.status(200).send();
});

// correlator
/* router.all('/', () => {
  try {
    taskModel.find({}).then((openTasks) => {
      Promise.all(openTasks.map(async ({
        pid, callback, _id: id, body, label, instance,
      }) => {
        matchTask(pid, body).then((producedTask) => {
          if (producedTask) {
            logger.info(`MATCH Task: ${{
              id, label, pid, instance, body,
            }} with ${producedTask}`);

            const cArr = ['1', '2'].includes(pid);

            Promise.all([
              callbackInstance(callback, {
                ...producedTask.body,
                timestamp: producedTask.timestamp,
              }, cArr && { 'cpee-update': true }), // callback to CPEE
              ...!cArr ? [taskModel.findByIdAndDelete(id)] : [], // remove from task list
              ...pid !== '6' ? [
                producedModel.findByIdAndDelete(producedTask._id),
              ] : [], // remove from produced list
            ]);

            sendEventsToAll(id, 'remove'); // sse
          }
        }); // match
      }));
    }); // get all open tasks
  } catch (error) {
    console.error(error);
  }
}); */

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
