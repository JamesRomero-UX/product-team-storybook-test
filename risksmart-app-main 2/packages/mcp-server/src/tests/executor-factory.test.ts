import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { McpSession } from '../auth/authenticate';
import {
  AuthenticationError,
  AuthorizationError,
  ToolExecutionError,
} from '../errors';
import { executeToolForSession } from '../tools/executor-factory';
import type { ToolDefinition } from '../tools/registry';

vi.mock('../tools/tool-executor', () => ({
  executeTrpcTool: vi.fn(),
}));

vi.mock('../tools/rest-executor', () => ({
  executeRestTool: vi.fn(),
}));

const oauthSession: McpSession = {
  authType: 'oauth',
  orgId: 'org_123',
  userId: 'user-1',
  tenant: 'testtenant',
  accessToken: 'oauth-jwt',
};

const credentialSession: McpSession = {
  authType: 'credentials',
  orgId: 'org_123',
  tenant: 'testtenant',
  accessToken: 'cognito-jwt',
};

const allTool: ToolDefinition = {
  name: 'list_risks',
  description: 'List risks',
  procedurePath: 'frontend.risk.register',
  parameters: {} as never,
  availableVia: 'all',
};

const oauthOnlyTool: ToolDefinition = {
  name: 'get_risk_scores',
  description: 'Get risk scores',
  procedurePath: 'frontend.risk.scores',
  parameters: {} as never,
  availableVia: 'oauth-only',
};

describe('executeToolForSession (executor factory)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { executeTrpcTool } = await import('../tools/tool-executor');
    const { executeRestTool } = await import('../tools/rest-executor');
    vi.mocked(executeTrpcTool).mockResolvedValue('trpc-result');
    vi.mocked(executeRestTool).mockResolvedValue('rest-result');
  });

  it('routes OAuth session + all tool to tRPC executor', async () => {
    const { executeTrpcTool } = await import('../tools/tool-executor');

    const result = await executeToolForSession(allTool, {}, oauthSession);

    expect(result).toBe('trpc-result');
    expect(executeTrpcTool).toHaveBeenCalledWith(allTool, {}, oauthSession);
  });

  it('routes OAuth session + oauth-only tool to tRPC executor', async () => {
    const { executeTrpcTool } = await import('../tools/tool-executor');

    const result = await executeToolForSession(oauthOnlyTool, {}, oauthSession);

    expect(result).toBe('trpc-result');
    expect(executeTrpcTool).toHaveBeenCalledWith(
      oauthOnlyTool,
      {},
      oauthSession
    );
  });

  it('routes credential session + all tool to REST executor', async () => {
    const { executeRestTool } = await import('../tools/rest-executor');

    const result = await executeToolForSession(allTool, {}, credentialSession);

    expect(result).toBe('rest-result');
    expect(executeRestTool).toHaveBeenCalledWith(
      allTool,
      {},
      credentialSession
    );
  });

  it('throws AuthorizationError for credential session + oauth-only tool', async () => {
    const { executeTrpcTool } = await import('../tools/tool-executor');
    const { executeRestTool } = await import('../tools/rest-executor');

    await expect(
      executeToolForSession(oauthOnlyTool, {}, credentialSession)
    ).rejects.toThrow(AuthorizationError);

    expect(executeTrpcTool).not.toHaveBeenCalled();
    expect(executeRestTool).not.toHaveBeenCalled();
  });

  it('includes tool name in oauth-only error message', async () => {
    await expect(
      executeToolForSession(oauthOnlyTool, {}, credentialSession)
    ).rejects.toThrow('get_risk_scores');
  });

  // --- Shared auth guard ---

  it('throws AuthenticationError when OAuth session has no access token', async () => {
    const { executeTrpcTool } = await import('../tools/tool-executor');
    const noTokenSession: McpSession = {
      ...oauthSession,
      accessToken: '',
    };

    await expect(
      executeToolForSession(allTool, {}, noTokenSession)
    ).rejects.toThrow(AuthenticationError);

    expect(executeTrpcTool).not.toHaveBeenCalled();
  });

  it('throws AuthenticationError when credential session has no access token', async () => {
    const { executeRestTool } = await import('../tools/rest-executor');
    const noTokenSession: McpSession = {
      ...credentialSession,
      accessToken: '',
    };

    await expect(
      executeToolForSession(allTool, {}, noTokenSession)
    ).rejects.toThrow(AuthenticationError);

    expect(executeRestTool).not.toHaveBeenCalled();
  });

  // --- Top-level error catch ---

  it('wraps thrown errors from tRPC executor in ToolExecutionError', async () => {
    const { executeTrpcTool } = await import('../tools/tool-executor');
    vi.mocked(executeTrpcTool).mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(
      executeToolForSession(allTool, {}, oauthSession)
    ).rejects.toThrow(ToolExecutionError);

    await expect(
      executeToolForSession(allTool, {}, oauthSession)
    ).rejects.toThrow('Please try again later');
  });

  it('wraps thrown errors from REST executor in ToolExecutionError', async () => {
    const { executeRestTool } = await import('../tools/rest-executor');
    vi.mocked(executeRestTool).mockRejectedValue(new Error('Network failure'));

    await expect(
      executeToolForSession(allTool, {}, credentialSession)
    ).rejects.toThrow(ToolExecutionError);

    await expect(
      executeToolForSession(allTool, {}, credentialSession)
    ).rejects.toThrow('Please try again later');
  });
});
