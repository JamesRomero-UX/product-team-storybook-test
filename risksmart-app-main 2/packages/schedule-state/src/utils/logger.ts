import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: { level: (label) => ({ level: label }) },
  base: { service: 'schedule-state' },
  timestamp: pino.stdTimeFunctions.isoTime,
});
