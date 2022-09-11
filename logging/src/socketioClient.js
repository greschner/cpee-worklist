import { io } from 'socket.io-client';
import logger from './logger';
import { loggingModel } from './model';

const socketURL = process.env.SOCKET_URL; // get SOCKET_URL environment variable

// check if BOT_TOKEN exists
if (!socketURL) {
  throw new TypeError('SOCKET_URL environment variable must be provided!');
}

const socket = io(socketURL);

socket.on('plateid', async ({ plateid }, callback) => {
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
  console.log(result);
  console.log(response);
  callback(response);
});

export default socket;
