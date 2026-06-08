import { renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { useGetRibbonItemVisibilities } from './useGetRibbonItemVisibilities';

vi.mock('src/rbac/useHasPermission', () => ({
  useHasPermissionQuery: vi.fn(),
}));
const mockHasPermission = vi.mocked(useHasPermissionQuery);

vi.mock('@/hooks/useIsModuleEnabled', () => ({
  useIsModuleEnabled: vi.fn(),
}));
const mockIsModuleEnabled = vi.mocked(useIsModuleEnabled);

describe('useGetRibbonItemVisibilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockHasPermission.mockReturnValue({ hasPermission: false, loading: false });
    mockIsModuleEnabled.mockReturnValue(false);
  });

  it('should return all items as false when user has no permissions', async () => {
    const { result } = renderHook(() => useGetRibbonItemVisibilities());

    expect(result.current).toEqual({
      approvals: false,
      attestations: false,
      actions: false,
      risks: false,
      rcsa: false,
      indicators: false,
      policies: false,
      assessments: false,
      controls: false,
      issues: false,
      obligations: false,
    });
  });

  it('should return true for items when user has corresponding permissions and modules enabled', () => {
    mockIsModuleEnabled.mockReturnValue(true);

    when(mockHasPermission)
      .calledWith('read:change_request', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:attestation_record', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:action', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:risk', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:assessment', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:indicator', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:document', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:assessment', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:control', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:issue', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false })
      .calledWith('read:obligation', undefined, true)
      .mockReturnValueOnce({ hasPermission: true, loading: false });

    const { result } = renderHook(() => useGetRibbonItemVisibilities());

    expect(result.current).toEqual({
      approvals: true,
      attestations: true,
      actions: true,
      risks: true,
      rcsa: true,
      indicators: true,
      policies: true,
      assessments: true,
      controls: true,
      issues: true,
      obligations: true,
    });
  });

  it('should respect module settings', () => {
    when(mockIsModuleEnabled)
      .calledWith('approval')
      .mockReturnValue(false)
      .calledWith('document.subModules.attestation')
      .mockReturnValue(false)
      .calledWith('indicator')
      .mockReturnValue(false)
      .calledWith('action')
      .mockReturnValue(true)
      .calledWith('risk')
      .mockReturnValue(true)
      .calledWith('risk.subModules.rcsa_wizard')
      .mockReturnValue(true)
      .calledWith('document')
      .mockReturnValue(true)
      .calledWith('assessment')
      .mockReturnValue(true)
      .calledWith('control')
      .mockReturnValue(true)
      .calledWith('issue')
      .mockReturnValue(true)
      .calledWith('obligation')
      .mockReturnValue(true);

    mockHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });

    const { result } = renderHook(() => useGetRibbonItemVisibilities());

    expect(result.current.approvals).toBe(false);
    expect(result.current.attestations).toBe(false);
    expect(result.current.indicators).toBe(false);
    expect(result.current.actions).toBe(true);
    expect(result.current.risks).toBe(true);
  });

  it('should respect module disabled for attestations', () => {
    when(mockIsModuleEnabled)
      .calledWith('document.subModules.attestation')
      .mockReturnValue(false);

    mockHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });

    const { result } = renderHook(() => useGetRibbonItemVisibilities());

    expect(result.current.attestations).toBe(false);
  });

  it('should respect module disabled for policies', () => {
    when(mockIsModuleEnabled).calledWith('document').mockReturnValue(false);

    mockHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });

    const { result } = renderHook(() => useGetRibbonItemVisibilities());

    expect(result.current.policies).toBe(false);
  });

  it('should respect module disabled for obligations', () => {
    when(mockIsModuleEnabled).calledWith('obligation').mockReturnValue(false);

    mockHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });

    const { result } = renderHook(() => useGetRibbonItemVisibilities());

    expect(result.current.obligations).toBe(false);
  });
});
