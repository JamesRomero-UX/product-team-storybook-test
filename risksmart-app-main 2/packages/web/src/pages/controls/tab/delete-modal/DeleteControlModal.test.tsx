import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
import { render, screen } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import type { Props } from './DeleteControlModal';
import DeleteControlModal from './DeleteControlModal';

describe('DeleteControlModal', () => {
  const defaultProps: Props = {
    loading: false,
    isVisible: false,
    onDelete: vi.fn(),
    onDismiss: vi.fn(),
    showUnlink: false,
  };

  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <MemoryRouter>
      <NotificationProvider>{children}</NotificationProvider>
    </MemoryRouter>
  );

  const getUnlinkLink = () => screen.queryByText('Unlink instead?');

  it('displays unlink when showUnlink=true', () => {
    render(<DeleteControlModal {...defaultProps} showUnlink={true} />, {
      wrapper: Wrapper,
    });
    expect(getUnlinkLink()).toBeInTheDocument();
  });

  it('hides unlink when showUnlink=false', () => {
    render(<DeleteControlModal {...defaultProps} showUnlink={false} />, {
      wrapper: Wrapper,
    });
    expect(getUnlinkLink()).not.toBeInTheDocument();
  });
});
