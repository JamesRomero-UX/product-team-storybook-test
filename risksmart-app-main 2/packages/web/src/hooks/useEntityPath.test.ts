/* eslint-disable @typescript-eslint/no-explicit-any */
import { type GetEntitiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGetEntities } from './queries/entity/useGetEntities';
import { useEntityPath } from './useEntityPath';

// Mock the GraphQL query
vi.mock('./queries/entity/useGetEntities', () => ({
  useGetEntities: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useGetEntities);

describe('useEntityPath', () => {
  const mockEntities = [
    { Id: '1', Name: 'Corporate', ParentId: null },
    { Id: '2', Name: 'IT Department', ParentId: '1' },
    { Id: '3', Name: 'Security Team', ParentId: '2' },
    { Id: '4', Name: 'Development', ParentId: '2' },
  ] as unknown as GetEntitiesQuery['entity'];

  beforeEach(() => {
    mockedUseQuery.mockReturnValue({
      data: { entity: mockEntities },
      loading: false,
      error: undefined,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return entity path for nested entities', () => {
    const { result } = renderHook(() => useEntityPath());

    const entityPath = result.current.getEntityPath('3');
    expect(entityPath).toBe('Corporate > IT Department > Security Team');
  });

  it('should return entity path for top-level entity', () => {
    const { result } = renderHook(() => useEntityPath());

    const entityPath = result.current.getEntityPath('1');
    expect(entityPath).toBe('Corporate');
  });

  it('should return empty string for non-existent entity', () => {
    const { result } = renderHook(() => useEntityPath());

    const entityPath = result.current.getEntityPath('999');
    expect(entityPath).toBe('');
  });

  it('should return empty string for null entity ID', () => {
    const { result } = renderHook(() => useEntityPath());

    const entityPath = result.current.getEntityPath(null);
    expect(entityPath).toBe('');
  });

  it('should use custom separator', () => {
    const { result } = renderHook(() => useEntityPath());

    const entityPath = result.current.getEntityPath('3', ' / ');
    expect(entityPath).toBe('Corporate / IT Department / Security Team');
  });

  it('should handle very deep hierarchy without hardcoded limits', () => {
    const deepEntities = [
      { Id: '1', Name: 'Level 1', ParentId: null },
      { Id: '2', Name: 'Level 2', ParentId: '1' },
      { Id: '3', Name: 'Level 3', ParentId: '2' },
      { Id: '4', Name: 'Level 4', ParentId: '3' },
      { Id: '5', Name: 'Level 5', ParentId: '4' },
      { Id: '6', Name: 'Level 6', ParentId: '5' },
      { Id: '7', Name: 'Level 7', ParentId: '6' },
      { Id: '8', Name: 'Level 8', ParentId: '7' },
    ] as unknown as GetEntitiesQuery['entity'];

    mockedUseQuery.mockReturnValue({
      data: { entity: deepEntities },
      loading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useEntityPath());

    const entityPath = result.current.getEntityPath('8');
    expect(entityPath).toBe(
      'Level 1 > Level 2 > Level 3 > Level 4 > Level 5 > Level 6 > Level 7 > Level 8'
    );
  });

  it('should return loading state correctly', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useEntityPath());

    expect(result.current.loading).toBe(true);
  });
});
