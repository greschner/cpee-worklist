import createError from 'http-errors';
import mongoose from 'mongoose';

const crudTemplate = (func) => async (req, res, next) => {
  try {
    const result = await func(req, res, next);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof createError.HttpError) {
      next(error);
    } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
      next(createError.NotFound(`Cannot not find: ${error.filter}`));
    } else {
      next(createError.InternalServerError());
    }
  }
};

export default crudTemplate;
