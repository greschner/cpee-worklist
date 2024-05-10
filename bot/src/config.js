// handles environement variables
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN; // get BOT_TOKEN environment variable
const clientId = process.env.CLIENT_ID; // get CLIENT_ID environment variable
const loggingURL = process.env.LOGGING_SERVICE ?? 'https://logging:8005'; // get LOGGING_SERVICE environment variable
const cpeeURL = process.env.CPEE_URL ?? 'https://cpee.org/'; // get CPEE_URL environment variable
// get CPEE_PLAIN_INSTANCE_URL environment variable
const plainInstanceURL = process.env.CPEE_PLAIN_INSTANCE_URL ?? 'https://cpee.org/hub/server/Theses.dir/Jan%20Greschner.dir/Lab%20Plain%20Instance.xml';
const socketPath = process.env.SOCKET_PATH ?? '/socket.io'; // get SOCKET_PATH environment variable
const baseURL = process.env.BASE_URL ?? 'http://backend:8000'; // get BASE_URL environment variable
const sseClient = `${baseURL}/services/sse`; // get SSE_CLIENT_URL environment variable';

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

// check if SOCKET_SERVER exists
if (!baseURL) {
  throw new TypeError('BASE_URL environment variable must be provided!');
}

export {
  token,
  clientId,
  loggingURL,
  cpeeURL,
  plainInstanceURL,
  sseClient,
  baseURL,
  socketPath,
};
