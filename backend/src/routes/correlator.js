import express from 'express';
import axios from 'axios';
import { taskModel } from '../model';
import logger from '../logger';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // const xml = await readFile('/Users/jangreschner/dockerProjects/labMaster/logging/test_sub.xml', { encoding: 'utf8' });

    // cpee callback request
    if (req.headers['CPEE-CALLBACK']) {
      const t = await taskModel.create({
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
      return res.writeHead(200, { 'CPEE-CALLBACK': 'true' });
    }
  } catch (error) {
    console.error(error);
  }
  return res.sendStatus(200);
});

router.all('/', (req, res) => {
  res.sendStatus(200);
});

export default router;
