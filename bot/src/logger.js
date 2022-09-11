import pino from 'pino';

const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          minimumLevel: process.env.LOG_LEVEL || 'info',
          colorize: true,
          translateTime: 'SYS:dd.mm.yyyy HH:MM:ss o',
          ignore: 'hostname,pid',
        },
      },
      /* ...process.env.NODE_ENV === 'production' ? [{
        target: 'pino/file',
        options: {
          destination: '/Users/jangreschner/dockerProjects/labMaster/backend/test.log',
          mkdir: true },
      }] : [], */
    ],
  },
});

export default logger;
