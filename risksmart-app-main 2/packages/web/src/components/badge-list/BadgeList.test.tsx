import { render, screen } from '@testing-library/react';

import type { BadgeListProps } from './BadgeList';
import BadgeList from './BadgeList';

describe('BadgeList', () => {
  const props: BadgeListProps = {
    badges: ['Harry', 'Potter'],
  };

  it('renders BadgeList', () => {
    render(<BadgeList {...props} />);
    expect(screen.getByText('Harry')).toBeInTheDocument();
    expect(screen.getByText('Potter')).toBeInTheDocument();
  });
});
