import { render, screen } from '@testing-library/react';

import { Circle } from './Circle';

describe('Circle', () => {
  it('renders children', () => {
    render(<Circle>{'Children'}</Circle>);
    expect(screen.getByText('Children')).toBeInTheDocument();
  });
});
