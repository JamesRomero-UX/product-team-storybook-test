import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted ensures these are available when the hoisted vi.mock factory runs
const { mockIncrement, mockHistogram } = vi.hoisted(() => ({
  mockIncrement: vi.fn(),
  mockHistogram: vi.fn(),
}));

vi.mock('dd-trace', () => ({
  default: {
    init: vi.fn(),
    dogstatsd: {
      increment: mockIncrement,
      histogram: mockHistogram,
    },
    scope: () => ({ active: () => null }),
  },
}));

import { metrics } from '../utils/metrics';

describe('metrics utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('toolExecuted', () => {
    it('emits increment and histogram with correct tags', () => {
      metrics.toolExecuted('list_risks', 'oauth', 150);

      const expectedTags = ['tool:list_risks', 'auth_type:oauth'];
      expect(mockIncrement).toHaveBeenCalledWith(
        'mcp.tool.executed',
        1,
        expectedTags
      );
      expect(mockHistogram).toHaveBeenCalledWith(
        'mcp.tool.duration_ms',
        150,
        expectedTags
      );
    });
  });

  describe('toolError', () => {
    it('emits increment with tool name, error code, and auth type', () => {
      metrics.toolError('get_risk', 'validation_error', 'credentials');

      expect(mockIncrement).toHaveBeenCalledWith('mcp.tool.error', 1, [
        'tool:get_risk',
        'error_code:validation_error',
        'auth_type:credentials',
      ]);
    });
  });

  describe('authSuccess', () => {
    it('emits increment with auth type', () => {
      metrics.authSuccess('oauth');

      expect(mockIncrement).toHaveBeenCalledWith('mcp.auth.success', 1, [
        'auth_type:oauth',
      ]);
    });
  });

  describe('authFailure', () => {
    it('emits increment with auth type and reason', () => {
      metrics.authFailure('credentials', 'mcp_not_enabled');

      expect(mockIncrement).toHaveBeenCalledWith('mcp.auth.failure', 1, [
        'auth_type:credentials',
        'reason:mcp_not_enabled',
      ]);
    });
  });

  describe('dcrRequest', () => {
    it('emits increment with created outcome', () => {
      metrics.dcrRequest('created');

      expect(mockIncrement).toHaveBeenCalledWith('mcp.dcr.request', 1, [
        'outcome:created',
      ]);
    });

    it('emits increment with existing outcome', () => {
      metrics.dcrRequest('existing');

      expect(mockIncrement).toHaveBeenCalledWith('mcp.dcr.request', 1, [
        'outcome:existing',
      ]);
    });

    it('emits increment with error outcome', () => {
      metrics.dcrRequest('error');

      expect(mockIncrement).toHaveBeenCalledWith('mcp.dcr.request', 1, [
        'outcome:error',
      ]);
    });
  });
});
