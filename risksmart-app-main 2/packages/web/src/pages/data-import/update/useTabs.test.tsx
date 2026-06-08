import { renderHook, waitFor } from '@testing-library/react';
import { defaultMocks } from 'src/testing/mock-data';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import type { DataImport } from '../types';
import { useTabs } from './useTabs';

vitest.mock('src/routes/useGetDetailParentPath');

describe('useTabs', () => {
  const defaultDataImport: DataImport = {
    Id: '123',
    files: [],
  };

  it('should return a details and results tab', async () => {
    const { result } = renderHook(() => useTabs(undefined), {
      wrapper: getWrapper([...defaultMocks], 'graphql', 'permission', 'router'),
    });
    await waitFor(() => result.current);
    expect(result.current[0].label).toEqual('Details');
    expect(result.current[1].label).toEqual('Results');
  });

  it('results tab disabled when no data import provided', async () => {
    const { result } = renderHook(() => useTabs(undefined), {
      wrapper: getWrapper([...defaultMocks], 'graphql', 'permission', 'router'),
    });
    await waitFor(() => result.current);
    expect(result.current[0].label).toEqual('Details');
    expect(result.current[0].disabled).toEqual(false);
    expect(result.current[1].label).toEqual('Results');
    expect(result.current[1].disabled).toEqual(true);
  });

  it('results tab enabled when data import provided', async () => {
    const { result } = renderHook(() => useTabs(defaultDataImport), {
      wrapper: getWrapper([...defaultMocks], 'graphql', 'permission', 'router'),
    });
    await waitFor(() => result.current);
    expect(result.current[0].label).toEqual('Details');
    expect(result.current[0].disabled).toEqual(false);
    expect(result.current[1].label).toEqual('Results');
    expect(result.current[1].disabled).toEqual(false);
  });
});
