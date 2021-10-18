import express from 'express';
import loggingModel from '../model/logging.js';
import { crudMid } from '../middleware/index.js';

const router = express.Router();

const formatDeltatime = (format) => {
  let divisor;
  switch (format) {
    case 's':
      divisor = 1000;
      break;
    case 'm':
      divisor = 60000;
      break;
    case 'h':
      divisor = 3600000;
      break;
    case 'd':
      divisor = 86400000;
      break;
    default:
      return [];
  }

  return [{
    $set: {
      deltaTime: { $divide: ['$deltaTime', divisor] },
    },
  }];
};

const deltaTimeGenerator = (start, end, startTask, endTask, joinTask, grouped = false, format) => {
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
        let: { joinid: `$body.${joinTask}` },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$id', endTask] },
                  { $eq: [`$body.${joinTask}`, '$$joinid'] },
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
    ...formatDeltatime(format),
    ...grouped ? [{
      $group: {
        _id: null,
        avgDelta: { $avg: '$deltaTime' },
        stdDev: { $stdDevSamp: '$deltaTime' },
      },
    }] : [{ $project: { deltaTime: 1 } }],
    { $limit: 1000 },
  ];
};

router.get('/', crudMid(async ({
  query: {
    start, end, startTask, endTask, joinTask, grouped, format,
  },
}) => {
  const isTrue = (grouped === 'true');
  const tempResult = await loggingModel.aggregate(
    deltaTimeGenerator(start, end, startTask, endTask, joinTask, isTrue, format),
  );
  // promises.push(loggingModel.aggregate(deltaTimeGenerator(start, end, '3', '9', 'sampleid', grouped)));
  // promises.push(loggingModel.aggregate(deltaTimeGenerator(start, end, '1', '2', 'plateid', grouped)));

  if (isTrue) {
    return tempResult[0];
  }

  return tempResult;
}));

export default router;
