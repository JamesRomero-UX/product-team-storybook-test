import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { describe, expect, it, vi } from 'vitest';

import ProtectedRoute from './ProtectedRoute';

vi.mock('src/rbac/useHasPermission');
const useHasPermissionMock = vi.mocked(useHasPermissionQuery);

describe('ProtectedRoute', () => {
  const child = 'Test';
  const testPermission = 'read:acceptance';

  it('should throw error if the user does not have permissions', () => {
    useHasPermissionMock.mockImplementation(() => {
      return { hasPermission: false, loading: false };
    });

    expect(() =>
      render(
        <MemoryRouter>
          <ProtectedRoute permission={testPermission}>{child}</ProtectedRoute>
        </MemoryRouter>
      )
    ).toThrowError('Access to read:acceptance denied');
  });

  it('should render children is user has permission', () => {
    useHasPermissionMock.mockImplementation((permission) => {
      if (permission === testPermission) {
        return { hasPermission: true, loading: false };
      }

      return { hasPermission: false, loading: false };
    });

    render(
      <ProtectedRoute permission={testPermission}>{child}</ProtectedRoute>
    );
    expect(screen.queryByText(child)).toBeDefined();
  });
});
