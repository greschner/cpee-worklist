import mongoose from 'mongoose';
import socket from './socketioClient.js';
import bot from './bot.js';
import { token } from './config.js';
import db from './db.js';
import logger from './logger.js';
// import sseClient from './sseClient';
// connect to database
db();

// Login to Discord with your client's token
bot.login(token);

const gracefulStop = async (signal) => {
  logger.info(`${signal} signal received. Shutting down...`);
  bot.destroy();
  await mongoose.disconnect();
  // sseClient.close();
  socket.disconnect();
  process.exit();
};

// Enable graceful stop
process.once('SIGINT', gracefulStop);
process.once('SIGTERM', gracefulStop);
