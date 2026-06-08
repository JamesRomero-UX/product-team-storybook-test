import { act, renderHook } from '@testing-library/react';
import { useLocation } from 'react-router';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import { useTools } from './useTools';

// Mock react-router's useLocation
vi.mock('react-router', () => ({
  useLocation: vi.fn(),
}));

describe('useTools', () => {
  const mockLocation = { pathname: '/some-path' };

  beforeEach(() => {
    (useLocation as Mock).mockReturnValue(mockLocation);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with undefined toolsContent', () => {
    const { result } = renderHook(() => useTools());
    const [toolsContent] = result.current;

    expect(toolsContent).toBeUndefined();
  });

  it('should update toolsContent when setToolsContent is called', () => {
    const { result } = renderHook(() => useTools());

    act(() => {
      const [, setToolsContent] = result.current;
      setToolsContent('help');
    });

    const [toolsContent] = result.current;
    expect(toolsContent).toBe('help');
  });

  it('should reset toolsContent on location change except for notifications', () => {
    const { result, rerender } = renderHook(() => useTools());

    // Set initial content
    act(() => {
      const [, setToolsContent, locationChanged] = result.current;
      setToolsContent('help');
      // Change location
      locationChanged('/new-path');
    });

    rerender();

    const [toolsContent] = result.current;
    expect(toolsContent).toBeUndefined();
  });

  it('should preserve notifications content on location change', () => {
    const { result, rerender } = renderHook(() => useTools());

    // Set notifications content
    act(() => {
      const [, setToolsContent, locationChanged] = result.current;
      setToolsContent('notifications');
      // Change location
      locationChanged('/new-path');
    });

    rerender();

    const [toolsContent] = result.current;
    expect(toolsContent).toBe('notifications');
  });

  it('should preserve wizard content when on risks path', () => {
    const { result, rerender } = renderHook(() => useTools());

    // Set wizard content
    act(() => {
      const [, setToolsContent, locationChanged] = result.current;
      setToolsContent('wizard');
      // Change to risks path
      locationChanged('/risks/123');
    });

    rerender();

    const [toolsContent] = result.current;
    expect(toolsContent).toBe('wizard');
  });

  it('should reset wizard content when not on risks path', () => {
    const { result, rerender } = renderHook(() => useTools());

    // Set wizard content
    act(() => {
      const [, setToolsContent, locationChanged] = result.current;
      setToolsContent('wizard');
      // Change to non-risks path
      locationChanged('/other/123');
    });

    rerender();

    const [toolsContent] = result.current;
    expect(toolsContent).toBeUndefined();
  });
});
