import { getLogger } from 'log4js';

const logger = getLogger();
logger.level = 'debug';

console.debug = msg => logger.debug(msg);
console.info = msg => logger.info(msg);
console.trace = msg => logger.trace(msg);
console.warn = msg => logger.warn(msg);
console.error = msg => logger.error(msg);
console.fatal = msg => logger.fatal(msg);
