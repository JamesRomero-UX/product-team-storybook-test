import { McpError } from './mcp-error';

export class AuthenticationError extends McpError {
  constructor(message: string) {
    super({
      code: 'auth_error',
      message,
      httpStatus: 401,
    });
    this.name = 'AuthenticationError';
  }
}
