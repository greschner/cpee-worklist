import createError from 'http-errors';
import logger from '../logger';

// express middelware for validating incoming requests using Joi
const middleware = (schema, property) => (req, _res, next) => {
  const { error } = schema.validate(req[property]);
  if (!error) { next(); } else {
    const { details } = error;
    const message = details.map((i) => i.message).join(',');
    logger.warn(`Request-Body validation failed: ${message}`);
    next(createError(422, message));
  }
};

export default middleware;
