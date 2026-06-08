import { DisableRuleCommand } from '@aws-sdk/client-eventbridge';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { disableDataExportRule } from './disableDataExportRule';

const sendMock = vi.fn();

vi.mock('@aws-sdk/client-eventbridge', () => ({
  EventBridgeClient: vi.fn(() => ({
    send: sendMock,
  })),
  DisableRuleCommand: vi.fn((input) => ({ input })),
}));

vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('disableDataExportRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should call EventBridgeClient.send with the correct DisableRuleCommand', async () => {
    const ruleName = 'test-rule-name';
    sendMock.mockResolvedValue({});

    await expect(disableDataExportRule(ruleName)).resolves.not.toThrow();

    expect(DisableRuleCommand).toHaveBeenCalledWith({ Name: ruleName });
    expect(sendMock).toHaveBeenCalled();
  });

  it('should throw the original error when EventBridgeClient.send fails', async () => {
    const ruleName = 'test-rule-name';
    const testError = new Error('EventBridge error');
    sendMock.mockRejectedValue(testError);

    await expect(disableDataExportRule(ruleName)).rejects.toThrow(testError);
  });
});
