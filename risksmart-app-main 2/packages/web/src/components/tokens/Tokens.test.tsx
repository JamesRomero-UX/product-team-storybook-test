import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './Tokens';
import Tokens from './Tokens';

describe('Tokens', () => {
  const defaultProps: Props = {
    tokens: [],
    onRemove: vi.fn(),
  };

  const queryShowMoreLink = () => screen.queryByText('Show more');
  const queryShowFewerLink = () => screen.queryByText('Show fewer');

  it('displays all tokens by default', () => {
    render(
      <Tokens
        {...defaultProps}
        tokens={[
          {
            value: '1',
            label: 'token 1',
          },
          {
            value: '1',
            label: 'token 2',
          },
        ]}
      />,
      { wrapper: getWrapper([], 'router') }
    );

    expect(screen.queryByText('token 1')).toBeInTheDocument();
    expect(screen.queryByText('token 2')).toBeInTheDocument();
    expect(queryShowMoreLink()).not.toBeInTheDocument();
  });

  it('displays limited tokens', () => {
    render(
      <Tokens
        {...defaultProps}
        limit={1}
        tokens={[
          {
            value: '1',
            label: 'token 1',
          },
          {
            value: '1',
            label: 'token 2',
          },
        ]}
      />,
      { wrapper: getWrapper([], 'router') }
    );

    expect(screen.queryByText('token 1')).toBeInTheDocument();
    expect(screen.queryByText('token 2')).not.toBeInTheDocument();
    expect(screen.queryByText('token 2')).not.toBeInTheDocument();
    expect(queryShowMoreLink()).toBeInTheDocument();
  });

  it('shows all tokens when "Show more" is clicked', async () => {
    render(
      <Tokens
        {...defaultProps}
        limit={1}
        tokens={[
          {
            value: '1',
            label: 'token 1',
          },
          {
            value: '1',
            label: 'token 2',
          },
        ]}
      />,
      { wrapper: getWrapper([], 'router') }
    );
    await userEvent.click(queryShowMoreLink()!);

    expect(screen.queryByText('token 1')).toBeInTheDocument();
    expect(screen.queryByText('token 2')).toBeInTheDocument();
  });

  it('shows limited tokens when "Show fewer" is clicked', async () => {
    render(
      <Tokens
        {...defaultProps}
        limit={1}
        tokens={[
          {
            value: '1',
            label: 'token 1',
          },
          {
            value: '1',
            label: 'token 2',
          },
        ]}
      />,
      { wrapper: getWrapper([], 'router') }
    );
    await userEvent.click(queryShowMoreLink()!);
    await userEvent.click(queryShowFewerLink()!);

    expect(screen.queryByText('token 1')).toBeInTheDocument();
    expect(screen.queryByText('token 2')).not.toBeInTheDocument();
  });
});
