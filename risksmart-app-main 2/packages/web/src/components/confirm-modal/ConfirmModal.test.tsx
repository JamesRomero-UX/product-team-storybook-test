import { render, screen } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { ConfirmModalProps } from './ConfirmModal';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  const defaultProps: ConfirmModalProps = {
    onConfirm: vi.fn(),
    onDismiss: vi.fn(),
    isVisible: true,
    header: <div>{'Header'}</div>,
    children: <div>{'Children'}</div>,
  };

  const getConfirmButton = () =>
    screen.getByRole('button', { name: 'Confirm' });

  const getCancelButton = () => screen.getByRole('button', { name: 'Cancel' });

  it('renders a confirm button', () => {
    render(<ConfirmModal {...defaultProps} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getConfirmButton()).toBeInTheDocument();
  });

  it('renders a cancel button', () => {
    render(<ConfirmModal {...defaultProps} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getCancelButton()).toBeInTheDocument();
  });
});
