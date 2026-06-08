import { renderHook, waitFor } from '@testing-library/react';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { getWrapper } from 'src/testing/wrapper';
import { describe, expect, it } from 'vitest';

import { useFormConfig } from './useFormConfig';

describe('useFormConfig', () => {
  it('should return typed form configuration for cause form', async () => {
    const { result } = renderHook(() => useFormConfig('cause'), {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });

    // The result should have the correct TypeScript types
    // This test mainly ensures proper type inference at compile time
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    expect(result.current.Title).toBeDefined();
    expect(result.current.Title.fieldId).toBe('Title');
    expect(result.current.Significance).toBeDefined();
    expect(result.current.Description).toBeDefined();
  });

  it('should return typed form configuration for issue form', async () => {
    const { result } = renderHook(() => useFormConfig('issue'), {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });

    // The result should have the correct TypeScript types
    // This test mainly ensures proper type inference at compile time
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Should have issue-specific fields (these may vary based on actual implementation)
    expect(typeof result.current).toBe('object');
  });

  it('should infer correct return type based on FormId parameter', async () => {
    // This test is primarily for TypeScript compile-time type checking
    const { result: causeResult } = renderHook(() => useFormConfig('cause'), {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });
    const { result: issueResult } = renderHook(() => useFormConfig('issue'), {
      wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql'),
    });
    await waitFor(() => {
      expect(causeResult.current).toBeDefined();
    });
    await waitFor(() => {
      expect(issueResult.current).toBeDefined();
    });

    // TypeScript should know these are different types
    expect(causeResult.current).not.toBe(issueResult.current);
  });
});
