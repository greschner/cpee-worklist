import express from 'express';
import logger from '../logger.js';
import schemaValidation from '../middleware/schemaValidation.js';
import receiveSchema from '../schemata/receiveSchema.js';
import loggingModel from '../model/logging.js';

const router = express.Router();

// receive logging information
router.post('/', schemaValidation(receiveSchema.POST, 'body'), async (req, res, next) => {
  try {
    logger.info('%o', req.body); // log to console
    await loggingModel.create(req.body); // store request body to db
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default router;
