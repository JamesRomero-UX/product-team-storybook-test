export interface McpErrorOptions {
  /** MCP error code (e.g. 'validation_error', 'auth_error') */
  code: string;
  /** User-friendly message safe to show to AI clients */
  message: string;
  /** HTTP status code */
  httpStatus: number;
  /** Optional context for the error (e.g. which parameter was invalid) */
  context?: Record<string, unknown>;
}

export class McpError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly context?: Record<string, unknown>;

  constructor(options: McpErrorOptions) {
    super(options.message);
    this.name = 'McpError';
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.context = options.context;
  }

  /** Format for MCP client response — no internal details. */
  toMcpResponse(): {
    error: string;
    message: string;
    context?: Record<string, unknown>;
  } {
    return {
      error: this.code,
      message: this.message,
      ...(this.context ? { context: this.context } : {}),
    };
  }
}
