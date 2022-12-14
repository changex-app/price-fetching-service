import winston from 'winston';

/**
 * @param entry The message to be logged
 * @returns The formatted message
 */
function formatConsoleLog(entry: winston.LogEntry): string {
    return `[${entry.level}] ${entry.timestamp} | ${entry.stack ? entry.stack : entry.message}`;
}

const format = winston.format.combine(
    winston.format.colorize(),
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.printf(formatConsoleLog),
    winston.format.metadata()
);

const consoleTransport = new winston.transports.Console({
    level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'debug'
});

const winstonConfig = {
    format,
    transports: [consoleTransport],
    exitOnError: false
};

const logger = winston.createLogger(winstonConfig);

((): void => {
    logger.info(`Logger attached.`);
})();

export default logger;
