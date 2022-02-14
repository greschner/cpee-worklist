import Joi from 'joi';

const schemas = {
  POST: Joi.object().keys({
    pid: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  }).unknown(),
};

export default schemas;
