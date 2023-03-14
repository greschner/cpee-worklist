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

const deltaTimeGenerator = (start, end, startTask, endTask, joinTask, format, grouped = false) => {
  const q = { // match
    id: startTask,
    ...(startTask === 3) && { 'body.position': { $ne: '1' } },
    ...(start || end) && {
      timestamp: { ...start && { $gte: new Date(start) }, ...end && { $lte: new Date(end) } },
    },
  };

  return [
    { $match: q },
    { // destinct sampleid and take the one with min timestamp
      $group: {
        _id: `$body.${joinTask}`,
        date: { $min: '$timestamp' },
        doc: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { timestamp: '$date' }] } },
    },
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
    { // filter not matched documents aka not empty []
      $match: {
        decObj: { $ne: [] },
      },
    },
    {
      $set: {
        timestampExport: { $min: '$decObj.timestamp' },
      },
    },
    {
      $set: {
        deltaTime: { $subtract: ['$timestampExport', '$timestamp'] },
      },
    },
    {
      $match: {
        deltaTime: { $gt: 0 },
      },
    },
    ...formatDeltatime(format),
    ...grouped ? [{
      $group: {
        _id: null,
        avgDelta: { $avg: '$deltaTime' },
        stdDev: { $stdDevSamp: '$deltaTime' },
      },
    }] : [/* { $project: { deltaTime: 1 } } */],
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
    { allowDiskUse: true },
  );

  if (isTrue) {
    return tempResult[0];
  }

  return tempResult;
}));

export default router;
