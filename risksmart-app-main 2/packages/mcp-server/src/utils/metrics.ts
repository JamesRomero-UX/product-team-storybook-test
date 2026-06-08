import tracer from './tracer';

const stats = tracer.dogstatsd;

export const metrics = {
  toolExecuted: (toolName: string, authType: string, durationMs: number) => {
    const tags = [`tool:${toolName}`, `auth_type:${authType}`];
    stats.increment('mcp.tool.executed', 1, tags);
    stats.histogram('mcp.tool.duration_ms', durationMs, tags);
  },

  toolError: (toolName: string, errorCode: string, authType: string) => {
    stats.increment('mcp.tool.error', 1, [
      `tool:${toolName}`,
      `error_code:${errorCode}`,
      `auth_type:${authType}`,
    ]);
  },

  authSuccess: (authType: string) => {
    stats.increment('mcp.auth.success', 1, [`auth_type:${authType}`]);
  },

  authFailure: (authType: string, reason: string) => {
    stats.increment('mcp.auth.failure', 1, [
      `auth_type:${authType}`,
      `reason:${reason}`,
    ]);
  },

  dcrRequest: (outcome: 'created' | 'existing' | 'error') => {
    stats.increment('mcp.dcr.request', 1, [`outcome:${outcome}`]);
  },
};
