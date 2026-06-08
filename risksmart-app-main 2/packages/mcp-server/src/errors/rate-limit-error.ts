import { McpError } from './mcp-error';

export class RateLimitError extends McpError {
  constructor(message: string) {
    super({
      code: 'rate_limit_exceeded',
      message,
      httpStatus: 429,
    });
    this.name = 'RateLimitError';
  }
}
