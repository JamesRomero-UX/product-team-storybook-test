import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { ChangeRequestsModalProps } from './ConfirmChangeRequestModal';
import { ConfirmChangeRequestModal } from './ConfirmChangeRequestModal';

describe('ConfirmChangeRequestModal', () => {
  const defaultProps: ChangeRequestsModalProps = {
    onConfirm: vi.fn(),
    onDismiss: vi.fn(),
  };

  const getSubmitForApprovalButton = () =>
    screen.getByRole('button', { name: 'Submit for Approval' });

  const getCancelButton = () => screen.getByRole('button', { name: 'Cancel' });

  it('renders a "Submit for Approval" button', () => {
    render(<ConfirmChangeRequestModal {...defaultProps} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getSubmitForApprovalButton()).toBeInTheDocument();
  });

  it('renders a cancel button', () => {
    render(<ConfirmChangeRequestModal {...defaultProps} />, {
      wrapper: getWrapper([], 'router'),
    });
    expect(getCancelButton()).toBeInTheDocument();
  });

  it('called onDismiss on cancel click', async () => {
    const onDismiss = vi.fn();
    render(
      <ConfirmChangeRequestModal {...defaultProps} onDismiss={onDismiss} />,
      {
        wrapper: getWrapper([], 'router'),
      }
    );
    await userEvent.click(getCancelButton());
    expect(onDismiss).toHaveBeenCalled();
  });
});
