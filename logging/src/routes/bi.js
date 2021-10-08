import express from 'express';
import loggingModel from '../model/logging.js';
import crudTemplateMid from '../middleware/crudTemplate.js';

const router = express.Router();

const deltaTimeGenerator = (start, end, startTask, endTask, join, grouped = false) => {
  const q = { // match
    id: startTask,
    ...(start || end) && {
      timestamp: { ...start && { $gte: new Date(start) }, ...end && { $lte: new Date(end) } },
    },
  };

  return [
    { $match: q },
    {
      $lookup: {
        from: 'loggings',
        as: 'decObj',
        let: { joinid: `$body.${join}` },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$id', endTask] },
                  { $eq: [`$body.${join}`, '$$joinid'] },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $set: {
        timestampExport: { $max: '$decObj.timestamp' },
      },
    },
    {
      $set: {
        deltaTime: { $subtract: ['$timestampExport', '$timestamp'] },
      },
    },
    ...grouped ? [{
      $group: {
        _id: null,
        avgDelta: { $avg: '$deltaTime' },
        stdDev: { $stdDevSamp: '$deltaTime' },
      },
    }] : [],
    { $limit: 1000 },
  ];
};

router.get('/', crudTemplateMid(async ({ query: { start, end } }) => {
  const promises = [];
  promises.push(loggingModel.aggregate(deltaTimeGenerator(start, end, '3', '9', 'sampleid', true)));
  promises.push(loggingModel.aggregate(deltaTimeGenerator(start, end, '1', '2', 'plateid', true)));

  const [deltaSample, deltaPlate] = await Promise.all(promises);

  const result = {
    deltaSample: deltaSample[0],
    deltaPlate: deltaPlate[0],
  };

  console.log(result);

  return result;
}));

export default router;
