// created with lots of love by Jan André Greschner
import db from './db';
import app from './app';
import logger from './logger';
import { correlator } from './utils/cpee';

// connect to database
db.connect();

// set listening port
const PORT = process.env.PORT || 4000;

// listen on port
app.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});

// run correlator every 10 seconds
setInterval(correlator, 10000);

// abandonInstances(3536, 3546);
