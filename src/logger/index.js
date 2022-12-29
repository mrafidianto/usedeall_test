const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL,
  timestamo: pino.stdTimeFunctions.isoTime
});

module.exports = logger;