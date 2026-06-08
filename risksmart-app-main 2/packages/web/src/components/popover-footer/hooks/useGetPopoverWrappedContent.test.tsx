import { render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useGetPopoverWrappedContent from './useGetPopoverWrappedContent';

vi.mock('@risk-smart/themed-cloudscape-components/popover', () => ({
  default: vi.fn(({ children, content }) => (
    <>
      <div data-testid={'popover'}>{children}</div>
      {content}
    </>
  )),
}));

vi.mock('../PopoverFooter', () => ({
  default: vi.fn(({ message }) => (
    <div data-testid={'popover-footer'}>{message}</div>
  )),
}));

describe('useGetPopoverWrappedContent', () => {
  it('should return the content directly when onClick is provided', () => {
    const onClickMock = vi.fn();
    const { result } = renderHook(() =>
      useGetPopoverWrappedContent(onClickMock, 'No clickthrough message')
    );

    const content = <div>{'Test Content'}</div>;
    const wrappedContent = result.current(content);

    const { container, queryByTestId } = render(wrappedContent);
    expect(container.textContent).toBe('Test Content');
    expect(queryByTestId('popover')).toBeNull();
  });

  it('should return the content directly when noClickthroughMessageContent is not provided', () => {
    const { result } = renderHook(() =>
      useGetPopoverWrappedContent(undefined, undefined)
    );

    const content = <div>{'Test Content'}</div>;
    const wrappedContent = result.current(content);

    const { container, queryByTestId } = render(wrappedContent);
    expect(container.textContent).toBe('Test Content');
    expect(queryByTestId('popover')).toBeNull();
  });

  it('should not wrap the content in a Popover when both onClick and noClickthroughMessageContent are provided', () => {
    const onClickMock = vi.fn();
    const { result } = renderHook(() =>
      useGetPopoverWrappedContent(onClickMock, 'No clickthrough message')
    );

    const content = <div>{'Test Content'}</div>;
    const wrappedContent = result.current(content);

    const { container, queryByTestId } = render(wrappedContent);
    expect(container.textContent).toBe('Test Content');
    expect(queryByTestId('popover')).toBeNull();
  });

  it('should wrap the content in a Popover when onClick is not provided and noClickthroughMessageContent is provided', () => {
    const { result } = renderHook(() =>
      useGetPopoverWrappedContent(undefined, 'No clickthrough message')
    );

    const content = <div>{'Test Content'}</div>;
    const wrappedContent = result.current(content);

    const { getByTestId, getByText } = render(wrappedContent);

    expect(getByTestId('popover')).toBeDefined();
    expect(getByTestId('popover-footer')).toBeDefined();
    expect(getByTestId('popover-footer').textContent).toBe(
      'No clickthrough message'
    );
    expect(getByText('Test Content')).toBeDefined();
  });
});
