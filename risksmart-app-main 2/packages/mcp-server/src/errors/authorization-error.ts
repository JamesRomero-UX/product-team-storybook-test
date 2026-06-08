import { McpError } from './mcp-error';

export class AuthorizationError extends McpError {
  constructor(message: string) {
    super({
      code: 'authorization_error',
      message,
      httpStatus: 403,
    });
    this.name = 'AuthorizationError';
  }
}
