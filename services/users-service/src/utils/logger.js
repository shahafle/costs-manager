const pino = require('pino');
const MongoLogStream = require('./mongo_log_stream');

const serviceName = process.env.SERVICE_NAME || 'users-service';
const streams = [{ stream: new MongoLogStream({ serviceName }) }];

if (process.env.NODE_ENV === 'development') {
  streams.push({
    stream: require('pino-pretty')({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'hostname',
    }),
  });
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
}, pino.multistream(streams));

module.exports = logger;

