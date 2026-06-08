import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  cancelAllTimers,
  createRequestLogger,
  createTimer,
  generateRequestId,
  getActiveTimersCount,
  logger,
  logRequestEnd,
  logRequestStart,
  logStartup,
} from './logger';

describe('logger utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    cancelAllTimers();
  });

  describe('generateRequestId', () => {
    it('should generate a valid UUID', () => {
      const id = generateRequestId();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('createRequestLogger', () => {
    it('should create a logger with request metadata', () => {
      const metadata = {
        requestId: 'test-request-id',
        tenantId: 'test-tenant-id',
        userId: 'test-user-id',
        method: 'GET',
        path: '/test',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      const requestLogger = createRequestLogger(metadata);
      expect(requestLogger).toBeDefined();
      expect(typeof requestLogger.info).toBe('function');
      expect(typeof requestLogger.error).toBe('function');
      expect(typeof requestLogger.warn).toBe('function');
    });
  });

  describe('logStartup', () => {
    it('should log startup information', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');

      const config = {
        port: 3000,
        env: 'test',
        appEnv: 'testing',
      };

      logStartup(config);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'startup',
          port: 3000,
          env: 'test',
          timestamp: expect.any(String) as string,
        }),
        'External API server starting'
      );
    });
  });

  describe('logRequestStart', () => {
    it('should log request start and return request logger', () => {
      const metadata = {
        requestId: 'test-request-id',
        tenantId: 'test-tenant-id',
        userId: 'test-user-id',
        method: 'GET',
        path: '/test',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      const requestLogger = logRequestStart(metadata);

      expect(requestLogger).toBeDefined();
      expect(typeof requestLogger.info).toBe('function');
    });
  });

  describe('logRequestEnd', () => {
    it('should log successful request completion', () => {
      const requestLogger = createRequestLogger({
        requestId: 'test-request-id',
        method: 'GET',
        path: '/test',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      const loggerInfoSpy = vi.spyOn(requestLogger, 'info');

      logRequestEnd(requestLogger, 200, 100);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'request_end',
          statusCode: 200,
          duration: 100,
          error: undefined,
        }),
        'Request completed successfully'
      );
    });

    it('should log client error', () => {
      const requestLogger = createRequestLogger({
        requestId: 'test-request-id',
        method: 'GET',
        path: '/test',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      const loggerWarnSpy = vi.spyOn(requestLogger, 'warn');

      logRequestEnd(requestLogger, 400, 50);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'request_end',
          statusCode: 400,
          duration: 50,
          error: undefined,
        }),
        'Request completed with client error'
      );
    });

    it('should log server error', () => {
      const requestLogger = createRequestLogger({
        requestId: 'test-request-id',
        method: 'GET',
        path: '/test',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      const loggerErrorSpy = vi.spyOn(requestLogger, 'error');
      const error = new Error('Test error');

      logRequestEnd(requestLogger, 500, 200, error);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'request_end',
          statusCode: 500,
          duration: 200,
          error: {
            message: 'Test error',
            stack: expect.any(String) as string,
            name: 'Error',
          },
        }),
        'Request completed with error'
      );
    });
  });

  describe('createTimer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create a timer and complete successfully', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');
      const timer = createTimer('Test operation', { testData: 'value' });

      expect(timer.timerId).toBeDefined();
      expect(getActiveTimersCount()).toBe(1);

      timer.end({ result: 'success' });

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'timer_completed',
          timerId: timer.timerId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          startTime: expect.any(Number),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endTime: expect.any(Number),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          elapsedTime: expect.any(Number),
          testData: 'value',
          result: 'success',
        }),
        'Timer completed: Test operation'
      );
      expect(getActiveTimersCount()).toBe(0);
    });

    it('should cancel a timer successfully', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');
      const timer = createTimer('Test operation', { testData: 'value' });

      expect(getActiveTimersCount()).toBe(1);

      timer.cancel();

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'timer_cancelled',
          timerId: timer.timerId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          startTime: expect.any(Number),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endTime: expect.any(Number),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          elapsedTime: expect.any(Number),
          testData: 'value',
        }),
        'Timer cancelled: Test operation'
      );
      expect(getActiveTimersCount()).toBe(0);
    });

    it('should timeout automatically and log warning', () => {
      const loggerWarnSpy = vi.spyOn(logger, 'warn');
      const timer = createTimer('Test operation', { testData: 'value' }, 1000);

      expect(getActiveTimersCount()).toBe(1);

      vi.advanceTimersByTime(1000);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'timer_timeout',
          timerId: timer.timerId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          startTime: expect.any(Number),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endTime: expect.any(Number),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          elapsedTime: expect.any(Number),
          timeoutMs: 1000,
          testData: 'value',
        }),
        'Timer timeout: Test operation'
      );
      expect(getActiveTimersCount()).toBe(0);
    });

    it('should handle multiple timers without overlap', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');

      const timer1 = createTimer('Operation 1', { op: 1 });
      const timer2 = createTimer('Operation 2', { op: 2 });
      const timer3 = createTimer('Operation 3', { op: 3 });

      expect(getActiveTimersCount()).toBe(3);

      timer2.end();
      expect(getActiveTimersCount()).toBe(2);

      timer1.cancel();
      expect(getActiveTimersCount()).toBe(1);

      timer3.end();
      expect(getActiveTimersCount()).toBe(0);

      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
    });

    it('should use default timeout of 30 seconds', () => {
      const loggerWarnSpy = vi.spyOn(logger, 'warn');
      createTimer('Test operation');

      vi.advanceTimersByTime(30000);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timeoutMs: 30000,
        }),
        'Timer timeout: Test operation'
      );
    });

    it('should handle ending an already ended timer gracefully', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');
      const timer = createTimer('Test operation');

      timer.end();
      timer.end(); // Try to end again

      expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
      expect(getActiveTimersCount()).toBe(0);
    });

    it('should handle cancelling an already cancelled timer gracefully', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');
      const timer = createTimer('Test operation');

      timer.cancel();
      timer.cancel(); // Try to cancel again

      expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
      expect(getActiveTimersCount()).toBe(0);
    });

    it('should prevent timeout after timer is ended', () => {
      const loggerWarnSpy = vi.spyOn(logger, 'warn');
      const loggerInfoSpy = vi.spyOn(logger, 'info');
      const timer = createTimer('Test operation', {}, 1000);

      timer.end();
      vi.advanceTimersByTime(1000);

      expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
      expect(getActiveTimersCount()).toBe(0);
    });

    it('should use custom logger when provided', () => {
      const customLogger = logger.child({ service: 'test' });
      const customLoggerInfoSpy = vi.spyOn(customLogger, 'info');

      const timer = createTimer('Test operation', {}, 30000, customLogger);
      timer.end();

      expect(customLoggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'timer_completed',
        }),
        'Timer completed: Test operation'
      );
    });

    it('should merge initial and final metadata correctly', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');
      const timer = createTimer('Test operation', {
        initial: 'data',
        shared: 'original',
      });

      timer.end({ final: 'data', shared: 'overridden' });

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          initial: 'data',
          final: 'data',
          shared: 'overridden', // Final metadata should override initial
        }),
        'Timer completed: Test operation'
      );
    });
  });

  describe('cancelAllTimers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should cancel all active timers', () => {
      const loggerInfoSpy = vi.spyOn(logger, 'info');

      createTimer('Operation 1');
      createTimer('Operation 2');
      createTimer('Operation 3');

      expect(getActiveTimersCount()).toBe(3);

      cancelAllTimers();

      expect(getActiveTimersCount()).toBe(0);
      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'timer_force_cancelled',
        }),
        expect.stringContaining('Timer force cancelled:')
      );
    });

    it('should handle empty timer list gracefully', () => {
      expect(getActiveTimersCount()).toBe(0);

      cancelAllTimers();

      expect(getActiveTimersCount()).toBe(0);
    });
  });

  describe('getActiveTimersCount', () => {
    it('should return correct count of active timers', () => {
      expect(getActiveTimersCount()).toBe(0);

      const timer1 = createTimer('Op 1');
      expect(getActiveTimersCount()).toBe(1);

      const timer2 = createTimer('Op 2');
      expect(getActiveTimersCount()).toBe(2);

      timer1.end();
      expect(getActiveTimersCount()).toBe(1);

      timer2.cancel();
      expect(getActiveTimersCount()).toBe(0);
    });
  });
});
