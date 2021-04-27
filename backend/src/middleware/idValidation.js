import createError from 'http-errors';

const validateid = (func) => async (req, res, next) => {
  try {
    const result = await func(req, res, next);
    // check if id was found
    if (result) {
      req.result = result;
      next();
    } else {
      next(createError.NotFound()); // return 404 http
    }
  } catch (error) {
    next(error);
  }
};

export default validateid;
