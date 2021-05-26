import express from 'express';
// import logger from '../logger.js';
import schemaValidation from '../middleware/schemaValidation.js';
import receiveSchema from '../schemata/receiveSchema.js';

const router = express.Router();

// receive logging information
router.post('/', schemaValidation(receiveSchema.POST, 'body'), (req, res, next) => {
  try {
    console.log(req.body);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default router;
