import { McpError } from './mcp-error';

export class ValidationError extends McpError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: 'validation_error',
      message,
      httpStatus: 400,
      context,
    });
    this.name = 'ValidationError';
  }
}
