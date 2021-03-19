require("dotenv").config();

const config = process.env;
const winston = require("winston");

const { format, transports } = winston;
const expressWinston = require("express-winston");

console.log(`Initializing logging in ${config.LOG_FORMAT} mode`);

const inlineType = (type) => {
  switch (type) {
    case "default":
      return format.printf(
        ({ level, message, timestamp }) => `[${timestamp}][${level}] ${message}`
      );
    case "express":
      return format.printf(({ level, message, timestamp, meta }) => {
        const msg = [];
        msg.push(`[${timestamp}]`);
        msg.push(`[${level}]`);
        msg.push(` ${message}`);
        msg.push(` from ${meta ? meta.req.headers.host : ""}`);
        msg.push(` at ${meta ? meta.req.headers["user-agent"] : ""}`);
        msg.push(` with status code ${meta ? meta.res.statusCode : ""}`);
        return msg.join("");
      });
    default:
      throw new Error(`Format type ${type} is not supported`);
  }
};

const csvType = (type) => {
  switch (type) {
    case "default":
      return format.printf(({ level, message, timestamp }) => {
        const msg = [];
        msg.push(timestamp);
        msg.push(level);
        msg.push(message);
        return msg.join(config.LOG_SEPARATOR);
      });
    case "express":
      return format.printf(({ level, message, timestamp, meta }) => {
        const msg = [];
        msg.push(timestamp);
        msg.push(level);
        msg.push(message);
        msg.push(meta ? meta.req.url : "");
        msg.push(meta ? meta.req.method : "");
        msg.push(meta ? meta.req.httpVersion : "");
        msg.push(meta ? meta.req.originalUrl : "");
        msg.push(meta ? JSON.stringify(meta.req.query) : "");
        msg.push(meta ? meta.res.statusCode : "");
        msg.push(meta ? meta.req.headers.host : "");
        msg.push(meta ? meta.req.headers.accept : "");
        msg.push(meta ? meta.req.headers.connection : "");
        return msg.join(config.LOG_SEPARATOR);
      });
    default:
      throw new Error(`Format type ${type} is not supported`);
  }
};

const combineFormats = (formatType, isConsole) => {
  const fmts = [];
  fmts.push(format.timestamp({ format: config.LOG_TSFORMAT }));
  if (isConsole) {
    fmts.push(format.colorize({ all: true }));
  }
  fmts.push(formatType);
  return format.combine(...fmts);
};

const getLogFormat = (formatType, isConsole) => {
  switch (config.LOG_FORMAT) {
    case "csv":
      return combineFormats(csvType(formatType), isConsole);
    case "inline":
      return combineFormats(inlineType(formatType), isConsole);
    case "json":
      return combineFormats(format.json(), false);
    case "logstash":
      return combineFormats(format.logstash(), false);
    case "pretty":
      return combineFormats(format.prettyPrint(), false);
    case "simple":
      return combineFormats(format.simple(), isConsole);
    default:
      throw new Error("LOG_FORMAT is not configured correctly in .env file");
  }
};

// Configuration for expressWinston.logger()
// https://github.com/bithavoc/express-winston
const options = {
  defaults: {
    level: "info",
    handleExceptions: true,
    exitOnError: false,
    format: format.json(),
  },
  defaultLogging: {
    level: "info",
    filename: "logs/default.log",
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    exitOnError: false,
    format: getLogFormat("default", false),
  },
  expressRequests: {
    level: "info",
    filename: "logs/default.log",
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    exitOnError: false,
    format: getLogFormat("express", false),
  },
  expressErrors: {
    level: "error",
    filename: "logs/error.log",
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    exitOnError: false,
    format: getLogFormat("express", false),
  },
  defaultConsole: {
    level: "info",
    handleExceptions: true,
    exitOnError: false,
    format: getLogFormat("default", true),
  },
  expressConsole: {
    level: "info",
    handleExceptions: true,
    exitOnError: false,
    format: getLogFormat("express", true),
  },
};

/* Default logger */
const log = winston.createLogger({
  ...options.defaults,
  transports: [
    new transports.Console(options.defaultConsole),
    new transports.File(options.defaultLogging),
    new transports.File(options.defaultLogging),
  ],
});

/* Express request handler */
const expressLogger = expressWinston.logger({
  ...options.defaults,
  transports: [
    new transports.Console(options.expressConsole),
    new transports.File(options.expressRequests),
    new transports.File(options.expressErrors),
  ],
});

/* Express error handler */
const expressErrorLogger = expressWinston.errorLogger({
  ...options.defaults,
  transports: [
    new transports.Console(options.expressConsole),
    new transports.File(options.expressRequests),
    new transports.File(options.expressErrors),
  ],
});

module.exports = {
  log,
  expressLogger,
  expressErrorLogger,
};
