import type { McpSession } from '../auth/authenticate';
import type { ToolDefinition } from './registry';

export type ToolExecutor = (
  toolDef: ToolDefinition,
  input: Record<string, unknown>,
  session: McpSession
) => Promise<string>;
