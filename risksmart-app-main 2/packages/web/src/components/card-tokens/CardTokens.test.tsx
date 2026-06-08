import { render, screen } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';

import type { Props } from './CardTokens';
import Tokens from './CardTokens';

describe('CardTokens', () => {
  const defaultProps: Props = {
    tokens: [],
  };

  it('displays tokens', () => {
    render(<Tokens {...defaultProps} tokens={['token 1', 'token 2']} />, {
      wrapper: getWrapper([], 'router'),
    });

    expect(screen.queryByText('token 1')).toBeInTheDocument();
    expect(screen.queryByText('token 2')).toBeInTheDocument();
  });
});
