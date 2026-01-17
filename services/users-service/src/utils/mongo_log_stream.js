const { Writable } = require('stream');
const mongoose = require('mongoose');
const Log = require('../models/Log');

const levelMap = { 10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal' };

class MongoLogStream extends Writable {
  constructor(options = {}) {
    super({ objectMode: true });
    this.serviceName = options.serviceName || process.env.SERVICE_NAME || 'users-service';
    this.initialized = false;
  }

  async _write(chunk, encoding, callback) {
    try {
      if (!this.initialized && mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
        this.initialized = true;
      }

      const log = JSON.parse(chunk.toString());
      const { level, time, pid, msg, ...rest } = log;

      new Log({
        level: levelMap[level] || 'info',
        time: new Date(time),
        pid,
        service: this.serviceName,
        message: msg || JSON.stringify(log),
        metadata: rest,
      }).save().catch(() => {}); // Silent fail

      callback();
    } catch {
      callback();
    }
  }
}

module.exports = MongoLogStream;
