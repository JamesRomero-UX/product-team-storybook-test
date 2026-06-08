import type { McpSession } from '../auth/authenticate';
import {
  AuthenticationError,
  AuthorizationError,
  McpError,
  ToolExecutionError,
} from '../errors';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import tracer from '../utils/tracer';
import type { ToolDefinition } from './registry';
import { executeRestTool } from './rest-executor';
import { executeTrpcTool } from './tool-executor';

/**
 * Route a tool call to the correct executor based on session auth type.
 *
 * - OAuth sessions → tRPC executor
 * - Credential sessions → REST executor
 * - OAuth-only tools called from credential sessions → helpful error message
 *
 * Shared guards (auth check, error normalisation) live here so individual
 * executors can focus on protocol-specific logic.
 */
export const executeToolForSession = async (
  toolDef: ToolDefinition,
  input: Record<string, unknown>,
  session: McpSession
): Promise<string> => {
  // Gate: OAuth-only tools cannot be called from credential sessions
  if (toolDef.availableVia === 'oauth-only' && session.authType !== 'oauth') {
    throw new AuthorizationError(
      `This tool (${toolDef.name}) is only available via OAuth authentication. Connect via Claude Desktop or ChatGPT to access user-scoped tools including risk scores, tags, and departments.`
    );
  }

  // Shared auth guard — both executors need a token
  if (!session.accessToken) {
    throw new AuthenticationError(
      'No access token available for tool execution'
    );
  }

  return tracer.trace(
    'mcp.tool.execute',
    {
      resource: toolDef.name,
      tags: {
        'mcp.tool.name': toolDef.name,
        'mcp.auth.type': session.authType,
        'mcp.org.id': session.orgId,
        'mcp.tool.procedure': toolDef.procedurePath,
      },
    },
    async (span) => {
      const startTime = Date.now();
      try {
        // Route to the correct executor
        const result =
          session.authType === 'oauth'
            ? await executeTrpcTool(toolDef, input, session)
            : await executeRestTool(toolDef, input, session);

        span?.setTag('mcp.tool.result_size', result.length);
        metrics.toolExecuted(
          toolDef.name,
          session.authType,
          Date.now() - startTime
        );

        return result;
      } catch (error) {
        span?.setTag('error', true);
        span?.setTag(
          'error.type',
          error instanceof McpError ? error.code : 'unknown'
        );

        const errorCode =
          error instanceof McpError ? error.code : 'unknown_error';
        metrics.toolError(toolDef.name, errorCode, session.authType);

        // Re-throw typed errors for the error handler middleware
        if (error instanceof McpError) {
          throw error;
        }

        // Wrap unexpected errors
        logger.error(
          { tool: toolDef.name, err: error },
          'Tool execution unexpected error'
        );
        throw new ToolExecutionError(toolDef.name, error);
      }
    }
  );
};
