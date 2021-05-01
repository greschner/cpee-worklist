import express from 'express';
import axios from 'axios';
import Task from './taskModel.js';
import idValidation from '../middleware/idValidation.js';
import logger from '../logger.js';

const router = express.Router();

// middlerware to validate the id
const valID = idValidation((req) => Task.findById(req.params.id));

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default (io) => {
  router.post('/receive', async (req, res, next) => {
    try {
      const t = await Task.create({
        label: req.headers['cpee-label'],
        activity: req.headers['cpee-activity'],
        callback: req.headers['cpee-callback'],
        callbackId: req.headers['cpee-callback-id'],
        instance: req.headers['cpee-instance'],
        instanceUuid: req.headers['cpee-instance-uuid'],
        instanceUrl: req.headers['cpee-instance-url'],
        body: req.body,
      });
      logger.info(`New Task created: ${t}`);
      res.set('CPEE-CALLBACK', 'true').sendStatus(200);
      io.emit('getTasks');
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

  router.get('/', async (req, res, next) => {
    try {
      const tasks = await Task.find({}).exec() || [];
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
      await Task.findByIdAndDelete(req.result._id);
      res.sendStatus(200);
      io.emit('getTasks');
    } catch (error) {
      next(error);
    }
  });

  return router;
};

// export default router;
