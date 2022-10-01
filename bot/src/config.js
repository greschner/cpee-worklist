// handles environement variables
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN; // get BOT_TOKEN environment variable
const clientId = process.env.CLIENT_ID; // get CLIENT_ID environment variable
const loggingURL = process.env.LOGGING_SERVICE; // get LOGGING_SERVICE environment variable
const cpeeURL = process.env.CPEE_URL; // get CPEE_URL environment variable
// get CPEE_PLAIN_INSTANCE_URL environment variable
const plainInstanceURL = process.env.CPEE_PLAIN_INSTANCE_URL;
// get CPEE_FINISH_WATCHER_URL environment variable
const finishWatcherURL = process.env.CPEE_FINISH_WATCHER_URL;
const sseClient = process.env.SSE_CLIENT_URL; // get SSE_CLIENT_URL environment variable
const socketServer = process.env.SOCKET_SERVER; // get SOCKET_SERVER environment variable

// check if BOT_TOKEN exists
if (!token) {
  throw new TypeError('BOT_TOKEN environment variable must be provided!');
}

// check if CLIENT_ID exists
if (!clientId) {
  throw new TypeError('CLIENT_ID environment variable must be provided!');
}

// check if LOGGING_SERVICE exists
if (!loggingURL) {
  throw new TypeError('LOGGING_SERVICE environment variable must be provided!');
}

// check if LOGGING_SERVICE exists
if (!cpeeURL) {
  throw new TypeError('CPEE_URL environment variable must be provided!');
}

// check if CPEE_PLAIN_INSTANCE_URL exists
if (!plainInstanceURL) {
  throw new TypeError('CPEE_PLAIN_INSTANCE_URL environment variable must be provided!');
}

// check if CPEE_FINISH_WATCHER_URL exists
if (!finishWatcherURL) {
  throw new TypeError('CPEE_FINISH_WATCHER_URL environment variable must be provided!');
}

// check if SSE_CLIENT_URL exists
if (!sseClient) {
  throw new TypeError('SSE_CLIENT_URL environment variable must be provided!');
}

// check if SOCKET_SERVER exists
if (!socketServer) {
  throw new TypeError('SOCKET_SERVER environment variable must be provided!');
}

export {
  token,
  clientId,
  loggingURL,
  cpeeURL,
  plainInstanceURL,
  finishWatcherURL,
  sseClient,
  socketServer,
};
