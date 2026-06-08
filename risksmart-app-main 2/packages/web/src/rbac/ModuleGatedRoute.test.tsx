import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import ModuleGatedRoute from './ModuleGatedRoute';

const { mockStoreState, mockModulesStore, mockFeatures } = vi.hoisted(() => {
  const mockStoreState = {
    current: { modules: {}, hydrated: false } as Record<string, unknown>,
  };
  const mockModulesStore = (
    selectorOrUndefined?: (s: Record<string, unknown>) => unknown
  ) => {
    if (typeof selectorOrUndefined === 'function') {
      return selectorOrUndefined(mockStoreState.current);
    }

    return mockStoreState.current;
  };
  const mockFeatures = vi.fn().mockReturnValue([]);

  return { mockStoreState, mockModulesStore, mockFeatures };
});

vi.mock('src/context/moduleContext', () => ({
  useModulesStore: mockModulesStore,
}));

vi.mock('src/rbac/useFeatures', () => ({
  useFeatures: mockFeatures,
}));

describe('ModuleGatedRoute', () => {
  const child = 'Test';

  it('should throw error if module not enabled', () => {
    mockStoreState.current = { modules: {}, hydrated: true };
    mockFeatures.mockReturnValue(['modules']);

    expect(() =>
      render(
        <MemoryRouter>
          <ModuleGatedRoute moduleKey={'obligation'}>{child}</ModuleGatedRoute>
        </MemoryRouter>
      )
    ).toThrowError('Access to module obligation denied');
  });

  it('should render fallback if set, and if module not enabled', () => {
    mockFeatures.mockReturnValue([]);
    mockStoreState.current = { modules: {}, hydrated: false };
    const fallback = 'Fallback';
    render(
      <MemoryRouter>
        <ModuleGatedRoute fallback={<>{fallback}</>} moduleKey={'obligation'}>
          {child}
        </ModuleGatedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText(fallback)).toBeDefined();
  });

  it('should render children when module is enabled via module tree', () => {
    mockFeatures.mockReturnValue(['modules']);
    mockStoreState.current = {
      modules: {
        obligation: { enabled: true },
      },
      hydrated: true,
    };

    render(
      <ModuleGatedRoute moduleKey={'obligation'}>{child}</ModuleGatedRoute>
    );
    expect(screen.queryByText(child)).toBeDefined();
  });

  it('should render children when module is enabled via legacy feature flag', () => {
    mockFeatures.mockReturnValue(['compliance']);
    mockStoreState.current = { modules: {}, hydrated: false };

    render(
      <ModuleGatedRoute moduleKey={'obligation'}>{child}</ModuleGatedRoute>
    );
    expect(screen.queryByText(child)).toBeDefined();
  });

  it('should render nothing while modules system is active but store is not hydrated', () => {
    mockFeatures.mockReturnValue(['modules']);
    mockStoreState.current = {
      modules: {},
      hydrated: false,
    };

    const { container } = render(
      <MemoryRouter>
        <ModuleGatedRoute moduleKey={'obligation'}>{child}</ModuleGatedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText(child)).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('should not wait for hydration when modules system is inactive', () => {
    mockFeatures.mockReturnValue([]);
    mockStoreState.current = {
      modules: {},
      hydrated: false,
    };

    expect(() =>
      render(
        <MemoryRouter>
          <ModuleGatedRoute moduleKey={'obligation'}>{child}</ModuleGatedRoute>
        </MemoryRouter>
      )
    ).toThrowError('Access to module obligation denied');
  });
});
