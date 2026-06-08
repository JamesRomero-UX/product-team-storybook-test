import { McpError } from './mcp-error';

export class NotFoundError extends McpError {
  constructor(message: string) {
    super({
      code: 'not_found',
      message,
      httpStatus: 404,
    });
    this.name = 'NotFoundError';
  }
}
