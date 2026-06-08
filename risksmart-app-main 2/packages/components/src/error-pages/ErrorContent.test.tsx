import { render, screen } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

import ErrorContent from './ErrorContent';

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('ErrorContent', () => {
  it('should display title even if no user is logged in', () => {
    const title = 'Some error';
    render(
      <ErrorContent
        title={title}
        // React 19 doesn't like empty string as src, using a 1x1 transparent pixel instead
        imgSrc={'data:image/gif;base64,R0lGODlhAQABAAAAACw='}
        imgAlt={''}
      >
        {'Content'}
      </ErrorContent>,
      {
        wrapper: Wrapper,
      }
    );
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
