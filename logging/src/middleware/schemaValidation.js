import createError from 'http-errors';
import logger from '../logger';

// express middelware for validating incoming requests using Joi
const middleware = (schema, property) => (req, _res, next) => {
  const { error, value } = schema.validate(req[property]);
  if (!error) {
    req[property] = value;
    next();
  } else {
    const { details } = error;
    const message = details.map((i) => i.message).join(',');
    logger.warn(`Request-Body validation failed: ${message}`);
    next(createError(422, message));
  }
};

export default middleware;
