import { render } from '@testing-library/react';

import SimpleRatingBadge from './SimpleRatingBadge';

describe('SimpleRatingBadge', () => {
  it('does not error when rating color is yellow', () => {
    const renderResult = render(
      <SimpleRatingBadge rating={{ color: 'yellow', label: 'bad colour' }} />
    );

    expect(() => renderResult).not.toThrow();
  });
});
