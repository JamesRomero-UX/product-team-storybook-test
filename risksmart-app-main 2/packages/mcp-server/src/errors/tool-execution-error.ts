import { McpError } from './mcp-error';

export class ToolExecutionError extends McpError {
  readonly originalError?: unknown;

  constructor(toolName: string, originalError?: unknown) {
    super({
      code: 'tool_execution_error',
      message: `Failed to execute ${toolName}. Please try again later.`,
      httpStatus: 500,
    });
    this.name = 'ToolExecutionError';
    this.originalError = originalError;
  }
}
