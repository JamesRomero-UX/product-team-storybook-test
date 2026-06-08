import { render, screen } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './ContributorTokens';
import { ContributorTokens } from './ContributorTokens';

describe('ContributorTokens', () => {
  const defaultProps: Props = {
    tokenOptions: [
      {
        value: 'direct1',
        label: 'Direct 1',
      },
    ],
    inheritedContributorLookup: new Set(['inherited1']),
    users: { user: [{ Id: 'inherited1', FriendlyName: 'Inherited 1' }] },
    userGroups: undefined,
    disabled: false,
    onRemoveToken: vi.fn(),
    showInheritedContributors: false,
  };

  it('should display inherited contributors when showInheritedContributors=true', () => {
    render(
      <ContributorTokens {...defaultProps} showInheritedContributors={true} />,
      { wrapper: getWrapper([], 'router') }
    );
    expect(screen.queryByText('Direct 1')).toBeInTheDocument();
    expect(screen.queryByText('Inherited 1')).toBeInTheDocument();
  });

  it('should hide inherited contributors when showInheritedContributors=false', () => {
    render(
      <ContributorTokens {...defaultProps} showInheritedContributors={false} />,
      { wrapper: getWrapper([], 'router') }
    );
    expect(screen.queryByText('Direct 1')).toBeInTheDocument();
    expect(screen.queryByText('Inherited 1')).not.toBeInTheDocument();
  });
});
