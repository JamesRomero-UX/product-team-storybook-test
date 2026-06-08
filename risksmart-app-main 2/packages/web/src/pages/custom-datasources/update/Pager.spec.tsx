import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './Pager';
import Pager from './Pager';

describe('Page', () => {
  const defaultProps: Props = {
    loading: false,
    currentPageIndex: 1,
    pageSize: 10,
    onPageChangeClick: vi.fn(),
    currentPageSize: 10,
  };
  const getPreviousPage = () => screen.getByTestId('previous-page');
  const getNextPage = () => screen.getByTestId('next-page');

  it('disables both forwards and backwards when loading = true', () => {
    render(<Pager {...defaultProps} loading={true} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getPreviousPage().getAttribute('disabled')).not.toBeNull();
    expect(getNextPage().getAttribute('disabled')).not.toBeNull();
  });

  it('enables both forwards and backwards when loading = false', () => {
    render(<Pager {...defaultProps} loading={false} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getPreviousPage().getAttribute('disabled')).toBeNull();
    expect(getNextPage().getAttribute('disabled')).toBeNull();
  });

  it('calls onPageChangeClick with the previous page index when previous clicked', async () => {
    const onPageChangeClick = vi.fn();
    render(
      <Pager
        {...defaultProps}
        loading={false}
        onPageChangeClick={onPageChangeClick}
      />,
      {
        wrapper: getWrapper([], 'router'),
      }
    );
    await userEvent.click(getPreviousPage());
    expect(onPageChangeClick).toHaveBeenCalledWith({ requestedPageIndex: 0 });
  });

  it('calls onPageChangeClick with the next page index when previous clicked', async () => {
    const onPageChangeClick = vi.fn();
    render(
      <Pager
        {...defaultProps}
        loading={false}
        onPageChangeClick={onPageChangeClick}
      />,
      {
        wrapper: getWrapper([], 'router'),
      }
    );
    await userEvent.click(getNextPage());
    expect(onPageChangeClick).toHaveBeenCalledWith({ requestedPageIndex: 2 });
  });

  it('disables previous page when currentPageIndex=0', () => {
    render(<Pager {...defaultProps} currentPageIndex={0} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getPreviousPage().getAttribute('disabled')).not.toBeNull();
    expect(getNextPage().getAttribute('disabled')).toBeNull();
  });

  it('disables next page when currentPageSize < pageSize', () => {
    render(<Pager {...defaultProps} currentPageSize={9} pageSize={10} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getPreviousPage().getAttribute('disabled')).toBeNull();
    expect(getNextPage().getAttribute('disabled')).not.toBeNull();
  });
});
