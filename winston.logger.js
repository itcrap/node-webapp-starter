require('dotenv').config()
const config = process.env;
const { format, transports } = require("winston");
const expressWinston = require('express-winston');

console.log(`Initializing logging in ${config.LOG_FORMAT} mode`)

const outputFormat = () => {

  const inlineFormat = format.printf(({ level, message, label, timestamp, meta }) => {
    const summary = []
    summary.push(`[${timestamp}]`);
    summary.push(`[${level}]`);
    summary.push(message);
    summary.push(`from ${meta.req.headers.host}`);
    summary.push(meta.req.headers["user-agent"]);
    return summary.join(" ");
  });

  const csvFormat = format.printf(({ level, message, label, timestamp, meta }) => {
    const summary = []
    summary.push(timestamp);
    summary.push(level);
    summary.push(message);
    summary.push(meta ? JSON.stringify(meta) : '');
    return summary.join(";");
  });

  switch (config.LOG_FORMAT) {
    case "json":
      return format.combine(format.timestamp({ format: config.LOG_TSFORMAT }), format.json())
      break;
    case "pretty":
      return format.combine(format.timestamp({ format: config.LOG_TSFORMAT }), format.prettyPrint())
      break;
    case "simple":
      return format.combine(format.timestamp({ format: config.LOG_TSFORMAT }), format.simple())
      break;
    case "csv":
      return format.combine(format.timestamp({ format: config.LOG_TSFORMAT }), format.splat(), csvFormat)
      break;
    case "inline":
      return format.combine(format.timestamp({ format: config.LOG_TSFORMAT }), format.splat(), inlineFormat)
      break;
    default:
      throw new Error("LOG_FORMAT is not configured correctly in .env file");
  }
}

const outputColorize = () => {
  return config.LOG_FORMAT == 'simple' ? format.combine(format.colorize(), outputFormat()) : outputFormat()
}

// Configuration for expressWinston.logger()
// https://github.com/bithavoc/express-winston 
const options = {
  defaults: {
    level: 'info',
    handleExceptions: true,
    exitOnError: false,
    format: format.json()
  },
  outputDefault: {
    level: 'info',
    filename: `logs/default.log`,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    exitOnError: false,
    format: outputFormat()
  },
  outputError: {
    level: 'error',
    filename: `logs/error.log`,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    exitOnError: false,
    format: outputFormat()
  },
  outputConsole: {
    level: 'info',
    handleExceptions: true,
    exitOnError: false,
    format: outputColorize()
  },
};

/* Express request handler */
const webpackLogger = expressWinston.logger({
  ...options.defaults,
  transports: [
    new(transports.Console)(options.outputConsole),
    new(transports.File)(options.outputDefault),
    new(transports.File)(options.outputError),
  ]
})

/* Express error handler */
const webpackErrorLogger = expressWinston.errorLogger({
  ...options.defaults,
  transports: [
    new(transports.Console)(options.outputConsole),
    new(transports.File)(options.outputDefault),
    new(transports.File)(options.outputError),
  ]
});

module.exports = {
  webpackLogger,
  webpackErrorLogger
}