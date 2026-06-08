import { McpError } from './mcp-error';

export class ExternalServiceError extends McpError {
  constructor(service: string, message: string) {
    super({
      code: 'external_service_error',
      message: `${service} temporarily unavailable. ${message}`,
      httpStatus: 502,
    });
    this.name = 'ExternalServiceError';
  }
}
