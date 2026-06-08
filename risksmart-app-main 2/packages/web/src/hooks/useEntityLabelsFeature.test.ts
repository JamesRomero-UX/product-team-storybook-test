import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Unmock the hook for this test file since we're testing it directly
vi.unmock('@/hooks/useEntityLabelsFeature');

import { useEntityLabelsFeature } from './useEntityLabelsFeature';

// Mock the entity filter context
vi.mock('@risksmart-app/components/src/contexts/entityFilterContext', () => ({
  useEntityFilter: vi.fn(),
}));

// Mock the module enabled hook
vi.mock('@/hooks/useIsModuleEnabled', () => ({
  useIsModuleEnabled: vi.fn(),
}));

import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

const mockUseEntityFilter = vi.mocked(useEntityFilter);
const mockUseIsModuleEnabled = vi.mocked(useIsModuleEnabled);

describe('useEntityLabelsFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to entities enabled
    mockUseIsModuleEnabled.mockReturnValue(true);
  });

  it('should show labels when no entity filter is applied', () => {
    mockUseEntityFilter.mockReturnValue({
      entityIds: [],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature());

    expect(result.current.shouldShowEntityLabels).toBe(true);
    expect(result.current.hasEntityFilter).toBe(false);
    expect(result.current.isMultiEntityContext).toBe(true);
    expect(result.current.entityFilterCount).toBe(0);
  });

  it('should not show labels when single entity is filtered', () => {
    mockUseEntityFilter.mockReturnValue({
      entityIds: ['entity-1'],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature());

    expect(result.current.shouldShowEntityLabels).toBe(false);
    expect(result.current.hasEntityFilter).toBe(true);
    expect(result.current.isMultiEntityContext).toBe(false);
    expect(result.current.entityFilterCount).toBe(1);
  });

  it('should show labels when multiple entities are filtered', () => {
    mockUseEntityFilter.mockReturnValue({
      entityIds: ['entity-1', 'entity-2'],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature());

    expect(result.current.shouldShowEntityLabels).toBe(true);
    expect(result.current.hasEntityFilter).toBe(true);
    expect(result.current.isMultiEntityContext).toBe(true);
    expect(result.current.entityFilterCount).toBe(2);
  });

  it('should respect explicit override to show labels', () => {
    mockUseEntityFilter.mockReturnValue({
      entityIds: ['entity-1'],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature(true));

    expect(result.current.shouldShowEntityLabels).toBe(true);
  });

  it('should respect explicit override to hide labels', () => {
    mockUseEntityFilter.mockReturnValue({
      entityIds: [],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature(false));

    expect(result.current.shouldShowEntityLabels).toBe(false);
  });

  it('should not show labels when entities feature is disabled', () => {
    mockUseIsModuleEnabled.mockReturnValue(false);
    mockUseEntityFilter.mockReturnValue({
      entityIds: [],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature());

    expect(result.current.shouldShowEntityLabels).toBe(false);
    expect(result.current.entitiesEnabled).toBe(false);
  });

  it('should not show labels when entities enabled but single entity context', () => {
    mockUseIsModuleEnabled.mockReturnValue(true);
    mockUseEntityFilter.mockReturnValue({
      entityIds: ['entity-1'],
      setEntityIds: vi.fn(),
    });

    const { result } = renderHook(() => useEntityLabelsFeature());

    expect(result.current.shouldShowEntityLabels).toBe(false);
    expect(result.current.entitiesEnabled).toBe(true);
    expect(result.current.entityFilterCount).toBe(1);
  });
});
