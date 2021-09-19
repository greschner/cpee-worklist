import express from 'express';
import createError from 'http-errors';
import logger from '../logger.js';
import schemaValidation from '../middleware/schemaValidation.js';
import receiveSchema from '../schemata/receiveSchema.js';
import loggingModel from '../model/logging.js';
import crudTemplateMid from '../middleware/crudTemplate.js';
import idValidation from '../middleware/idValidation.js';
// import authenticateJWT from '../middleware/authJWT.js';

const router = express.Router();

let clients = [];

const sendEventsToAll = (data) => {
  clients.forEach((client) => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
};

const groubByTimestamp = (format) => {
  let dateFormat = '%Y-%m-%d';

  if (format === 'y') {
    dateFormat = '%Y';
  } else if (format === 'm') {
    dateFormat = '%Y-%m';
  } else if (format === 'w') {
    dateFormat = '%Y-%V';
  } else if (format === 'h') {
    dateFormat = '%Y-%m-%d %H:00';
  }

  return { $dateToString: { format: dateFormat, date: '$timestamp' } };
};

// middlerware to validate the id
const valID = idValidation(({ params }) => loggingModel.findById(params.id));

/*
// secure endpoints on production environment
if (process.env.NODE_ENV === 'production') {
  router.use(authenticateJWT);
} */

// store logging information
router.post('/', schemaValidation(receiveSchema.POST, 'body'), crudTemplateMid(async ({ body }) => {
  logger.info('%o', body); // log to console
  const result = await loggingModel.create(body); // store request body to db
  sendEventsToAll(result);
  return result;
}));

// get all logging entries
router.get('/', crudTemplateMid(async ({
  query: {
    id, name, user, mac, sid, pid, sort = 'timestamp', order = -1, page, limit = 1000, start, end, groupby, format,
  },
}) => {
  const q = { // match
    ...id && { id: { $in: Array.isArray(id) ? id : [id] } },
    ...name && {
      name: { $in: Array.isArray(name) ? name : [name] },
    }, // equal to LIKE in SQL, option 'i' for case insensitive
    ...user && {
      user: { $in: Array.isArray(user) ? user : [user] },
    },
    ...mac && { mac },
    ...pid && { 'body.plateid': { $regex: pid, $options: 'i' } },
    ...sid && { 'body.sampleid': { $regex: sid, $options: 'i' } },
    ...(start || end) && {
      timestamp: { ...start && { $gte: new Date(start) }, ...end && { $lte: new Date(end) } },
    },
  };
  const [{ data, pagination }] = await loggingModel.aggregate([
    { $match: q },
    ...sort ? [{ $sort: { [sort]: parseInt(order, 10) } }] : [], // sort
    ...groupby ? [groupby === 'timestamp' ? { $group: { _id: groubByTimestamp(format), count: { $sum: 1 } } } : { $sortByCount: `$${groupby}` }] : [],
    ...groupby === 'timestamp' ? [{ $sort: { _id: -1 } }] : [],
    {
      $facet: {
        data: [ // pagination
          { $skip: (page - 1) * limit },
          { $limit: parseInt(limit, 10) ? parseInt(limit, 10) : 10000 },
        ],
        pagination: [ // count
          { $count: 'count' },
        ],
      },
    },
  ]) || [];
  return {
    data,
    count: pagination.length ? pagination[0].count : 0,
  };
}));

router.get('/sse', (req, res) => {
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });

  // res.write(`data: ${JSON.stringify({ value: 1220 })}\n\n`);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res,
  };

  clients.push(newClient);

  req.on('close', () => {
    logger.info(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
});

// get logging object by id
router.get('/:id', schemaValidation(receiveSchema.params, 'params'), valID, ({ result }, res) => res.json(result));

// get object property
router.get('/:id/:key', schemaValidation(receiveSchema.params, 'params'), valID, ({ result, params: { key } }, res, next) => (result[key] ? res.send(result[key]) : next(createError.NotFound())));

// get number of active sse clients
router.get('/status', (_request, response) => response.json({ clients: clients.length }));

export default router;
