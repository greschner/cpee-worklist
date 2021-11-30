import createError from 'http-errors';

const validateid = (func) => async (req, res, next) => {
  try {
    const result = await func(req, res, next);
    // check if id is null
    if (!result) {
      throw createError.NotFound(); // throw 404 http
    }
    req.result = result; // set result to req object
    next();
  } catch (error) {
    next(error);
  }
};

export default validateid;
