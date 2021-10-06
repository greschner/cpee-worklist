import express from 'express';
import loggingModel from '../model/logging.js';
import crudTemplateMid from '../middleware/crudTemplate.js';

const router = express.Router();

router.get('/', crudTemplateMid(async ({ query: { start, end } }) => {
  const q = { // match
    ...(start || end) && {
      timestamp: { ...start && { $gte: new Date(start) }, ...end && { $lte: new Date(end) } },
    },
  };

  const result = await loggingModel.aggregate([
    { $match: q },
  ]) || [];

  console.log(result);

  return result;
}));

export default router;
