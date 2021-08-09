import createError from 'http-errors';

const validateid = (func) => async (req, res, next) => {
  try {
    const result = await func(req, res, next);
    // check if id is null
    if (!result) {
      throw createError.NotFound(); // return 404 http
    }
    req.result = result;
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof createError.HttpError) {
      next(error);
    } else {
      next(createError.InternalServerError());
    }
  }
};

export default validateid;
