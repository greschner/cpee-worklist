import loggingModel from './loggingModel.js';
import logger from '../logger.js';
import loggingService from '../api/loggingService.js';

const getPlate = async (plateid) => {
  const response = {
    plateid,
    status: null,
  };

  const result = await loggingModel.aggregate([
    { $match: { 'body.plateid': plateid } },
    {
      $group: {
        _id: {
          id: '$id',
          name: '$name',
        },
        count: { $sum: 1 },
        docs: { $push: '$$ROOT' },
      },
    },
    {
      $set: {
        id: '$_id.id',
        name: '$_id.name',
      },
    },
    { $unset: '_id' },
  ]);

  if (result?.length) {
    response.status = 'pending';
    result.forEach(({ count, docs, id }) => {
      switch (id) {
        case '1': {
          const [{ timestamp }] = docs;
          response.created = timestamp;
          break;
        }
        case '2': {
          const [{ timestamp }] = docs;
          response.finished = timestamp;
          break;
        }
        case '3': {
          response.samples = count;
          break;
        }
        case '5': {
          const [{ timestamp }] = docs;
          response.eps = timestamp;
          break;
        }
        case '7': {
          const [{ timestamp }] = docs;
          response.validated = timestamp;
          break;
        }
        default:
          logger.warn(`Undefined mongo response object: ${id}`);
          break;
      }
    });
    if (response.validated) {
      response.status = 'done';
    }
  }

  return response;
};

const getSample = (sampleid) => loggingModel.find({ 'body.sampleid': sampleid }).sort({ timestamp: -1 });

const getStats = async (date) => {
  if (!(date instanceof Date) && Number.isNaN(date)) { // check if valid date object
    return null;
  }

  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(start.getTime() + 86400000); // + 1 day

  const response = {
    start,
    end,
  };

  const promises = [
    loggingService.getLogs({
      start, end, id: 1, distinct: 'plateid',
    }),
    loggingService.getLogs({
      start, end, id: 2, distinct: 'plateid',
    }),
    loggingService.getLogs({ start, end, id: 3 }),
    loggingService.getLogs({ start, end, id: 4 }),
    loggingService.getLogs({
      start, end, id: 7, distinct: 'plateid',
    }),
    loggingService.getLogs({
      start, end, id: 9, groupby: 'body.result',
    }),
  ];

  const [
    newPlates, finishedPlate, scannedSamples, deletedSamples, validatedPlates, posNeg,
  ] = await Promise.all(promises).catch(console.error);

  response.newPlates = newPlates.data.count;
  response.finishedPlates = finishedPlate.data.count;
  response.scannedSamples = scannedSamples.data.count;
  response.deletedSamples = deletedSamples.data.count;
  response.validatedPlates = validatedPlates.data.count;
  response.negatives = posNeg.data.data[0]?.count ?? 0;
  response.positives = posNeg.data.data[1]?.count ?? 0;
  response.positiveRate = response.positives / (response.positives + response.negatives);

  return response;
};

export { getPlate, getSample, getStats };
