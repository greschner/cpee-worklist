import jwt from 'jsonwebtoken';
import logger from '../logger';

// middleware for jwt authentication
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization; // get authorization header
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // remove 'Bearer' from string
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        logger.error(err); // log error
        return res.sendStatus(403);
      }
      req.user = user; // set user object for further usage
      logger.info(`User: ${user.user} access to ${req.url}`); // user request
      return next();
    });
  }
  res.sendStatus(401);
};

export default authenticateJWT;
