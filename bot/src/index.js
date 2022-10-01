import mongoose from 'mongoose';
import socket from './socketioClient';
import bot from './bot';
import { token } from './config';
import db from './db';
import logger from './logger';
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
