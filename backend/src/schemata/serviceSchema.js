import Joi from 'joi';

const schemas = {
  POST_PCHECK: Joi.object().keys({
    createdids: Joi.array().items(Joi.object()).required(),
    finishids: Joi.array().items(Joi.object()).required(),
  }),
};

export default schemas;
