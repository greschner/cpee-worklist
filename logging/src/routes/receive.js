import express from 'express';
import createError from 'http-errors';
import logger from '../logger.js';
import schemaValidation from '../middleware/schemaValidation.js';
import receiveSchema from '../schemata/receiveSchema.js';
import loggingModel from '../model/logging.js';
import crudTemplateMid from '../middleware/crudTemplate.js';
import idValidation from '../middleware/idValidation.js';

const router = express.Router();

// middlerware to validate the id
const valID = idValidation(({ params }) => loggingModel.findById(params.id));

// store logging information
router.post('/', schemaValidation(receiveSchema.POST, 'body'), crudTemplateMid(({ body }) => {
  logger.info('%o', body); // log to console
  return loggingModel.create(body); // store request body to db
}));

// get all logging entries
router.get('/', crudTemplateMid(async ({
  query: {
    id, name, user, mac, sid, sort = 'timestamp', order = -1, page, limit,
  },
}) => {
  const q = {
    ...id && { id },
    ...name && { name: { $regex: name, $options: 'i' } }, // equal to LIKE in SQL, option 'i' for case insensitive
    ...user && { user },
    ...mac && { mac },
    ...sid && { 'body.sampleid': { $regex: sid, $options: 'i' } },
  };
  const [{ data, pagination }] = await loggingModel.aggregate([
    { $match: q },
    ...sort ? [{ $sort: { [sort]: parseInt(order, 10) } }] : [],
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

// get logging object by id
router.get('/:id', schemaValidation(receiveSchema.params, 'params'), valID, ({ result }, res) => res.json(result));

// get object property
router.get('/:id/:key', schemaValidation(receiveSchema.params, 'params'), valID, ({ result, params: { key } }, res, next) => (result[key] ? res.send(result[key]) : next(createError.NotFound())));

export default router;
