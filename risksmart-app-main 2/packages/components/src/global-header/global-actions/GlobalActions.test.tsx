import { render, screen } from '@testing-library/react';

import { GlobalActions } from './GlobalActions';

describe('GlobalActions', () => {
  it('renders custom actions (children) only', () => {
    const customActions = (
      <>
        <button>{'Action 1'}</button>
        <button>{'Action 2'}</button>
      </>
    );

    render(<GlobalActions>{customActions}</GlobalActions>);

    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('renders system actions only', () => {
    const systemActions = (
      <>
        <button>{'Help'}</button>
        <button>{'Settings'}</button>
      </>
    );

    render(<GlobalActions>{systemActions}</GlobalActions>);

    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('renders user menu only', () => {
    const userMenu = <div>{'User Profile Menu'}</div>;

    render(<GlobalActions>{userMenu}</GlobalActions>);

    expect(screen.getByText('User Profile Menu')).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('renders custom actions and system actions without separator when no user menu', () => {
    const customActions = <button>{'Custom Action'}</button>;
    const systemActions = <button>{'System Action'}</button>;

    render(
      <GlobalActions>
        {systemActions}
        {customActions}
      </GlobalActions>
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
    expect(screen.getByText('System Action')).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('handles complex nested components', () => {
    const complexActions = (
      <div>
        <button>{'Button 1'}</button>
        <span>{'Separator'}</span>
        <button>{'Button 2'}</button>
      </div>
    );
    const complexUserMenu = (
      <div>
        <img src={'/avatar.jpg'} alt={'User Avatar'} />
        <span>{'John Doe'}</span>
        <button>{'Dropdown'}</button>
      </div>
    );

    render(
      <GlobalActions>
        {complexActions}
        {complexUserMenu}
      </GlobalActions>
    );

    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
    expect(screen.getByText('Separator')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Dropdown')).toBeInTheDocument();
  });
});
