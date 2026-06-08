import { render, screen } from '@testing-library/react';

import SimpleRatingBadge from './SimpleRatingBadge';

describe('SimpleRatingBadge', () => {
  it('does not error when rating color is yellow', async () => {
    render(
      <SimpleRatingBadge rating={{ color: 'yellow', label: 'bad colour' }} />
    );

    expect(await screen.findByText('bad colour')).toBeInTheDocument();
  });
});
