import express from 'express';
import { taskModel, producedModel } from '../model/index.js';
import logger from '../logger.js';
import { callbackInstance } from '../utils/cpee.js';
import { schemaValidation } from '../middleware/index.js';
import { taskSchema } from '../schemata/index.js';
import { SSEsendEventsToAll } from './services.js';

const router = express.Router();

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

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
          const cArr = ['1', '2'].includes(pid);

          if (pid !== '6') {
            producedModel.findByIdAndDelete(producedTask._id).then((producer) => {
              if (producer) {
                logger.info(`MATCH Task: ${JSON.stringify({
                  id, label, pid, instance, body,
                })} with ${producedTask}`);

                if (['8', '9'].includes(pid)) { // checks whether there are remaining exports
                  taskModel.find({
                    _id: { $ne: id }, pid, 'body.sampleid': body.sampleid,
                    /* 'body.plateid': body.plateid, */
                  }).then((tasks) => {
                    if (tasks.length) {
                      logger.info(`found other tasks: ${tasks}`);
                      tasks.forEach((task) => {
                        Promise.all([
                          callbackInstance(task.callback, {
                            ...producedTask.body,
                            timestamp: producedTask.timestamp,
                          }),
                          taskModel.findByIdAndDelete(task._id),
                        ]).catch((error) => { console.error(error); });
                      });
                    }
                  }).catch((error) => { console.error(error); });
                }

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

          SSEsendEventsToAll(id, 'remove'); // sse
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
      const newTask = () => {
        const task = {
          label: req.headers['cpee-label'],
          pid,
          activity: req.headers['cpee-activity'],
          callback: req.headers['cpee-callback'],
          callbackId: req.headers['cpee-callback-id'],
          instance: req.headers['cpee-instance'],
          instanceUuid: req.headers['cpee-instance-uuid'],
          instanceUrl: req.headers['cpee-instance-url'],
          timestamp: Date.now(),
          body,
        };

        if (['1', '2'].includes(pid)) {
          return taskModel.findOneAndUpdate(
            { pid },
            task,
            {
              new: true,
              upsert: true,
            },
          );
        }

        return taskModel.create(task);
      };

      newTask().then((task) => { // save new task to db
        logger.info(`New Task created: ${task}`);
        SSEsendEventsToAll(task, 'add'); // sse
        correlator();
      }).catch((error) => {
        console.error(error);
      });
      res.setHeader('CPEE-CALLBACK', 'true');
    }

    /* // producer
    if (req.headers['content-id'] === 'producer') {
      producedModel.create(req.body).then((t) => {
        logger.info(`New produced Task created: ${t}`);
        correlator();
      }).catch((error) => { console.error(error); }); // save new produced entry to db
    } */

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
    console.log(error);
    next(error);
  }
  res.status(200).send();
});

router.post('/producer', schemaValidation(taskSchema.POST, 'body'), (req, res) => {
  // save new produced entry to db
  producedModel.create(req.body)
    .then((t) => {
      logger.info(`New lab produced Task created: ${t}`);
    })
    .catch(console.log);

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

export default router;
