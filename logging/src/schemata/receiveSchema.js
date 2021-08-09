import Joi from 'joi';

const schemas = {
  POST: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    timestamp: Joi.date().iso(),
    macaddress: Joi.string().required(),
    user: Joi.string().required(),
    body: Joi.object().keys({}).default({}).unknown(),
  }),
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  }).unknown(),
};

export default schemas;
