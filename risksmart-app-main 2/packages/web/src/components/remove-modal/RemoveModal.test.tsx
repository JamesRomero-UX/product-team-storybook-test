import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { RemoveModalProps } from './RemoveModal';
import RemovalModal from './RemoveModal';

describe('RemoveModal', () => {
  const defaultProps: RemoveModalProps = {
    isVisible: true,
    onRemove: vi.fn(),
    onDismiss: vi.fn(),
    header: <div>{'Header'}</div>,
    children: <div>{'Children'}</div>,
  };

  const getRemoveButton = () =>
    screen.getByRole('button', { name: 'Yes, remove' });

  const getCancelButton = () => screen.getByRole('button', { name: 'Cancel' });

  it('renders a "Remove" button', () => {
    render(<RemovalModal {...defaultProps} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getRemoveButton()).toBeInTheDocument();
  });

  it('renders a cancel button', () => {
    render(<RemovalModal {...defaultProps} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getCancelButton()).toBeInTheDocument();
  });

  it('called onDismiss on cancel click', async () => {
    const onDismiss = vi.fn();
    render(<RemovalModal {...defaultProps} onDismiss={onDismiss} />, {
      wrapper: getWrapper([], 'router'),
    });
    await userEvent.click(getCancelButton());
    expect(onDismiss).toHaveBeenCalled();
  });
});
