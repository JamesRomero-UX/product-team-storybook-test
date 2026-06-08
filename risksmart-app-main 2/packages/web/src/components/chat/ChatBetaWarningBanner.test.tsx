import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { ChatBetaWarningBanner } from './ChatBetaWarningBanner';

// Mock the module enabled hook
vi.mock('@/hooks/useIsModuleEnabled', () => ({
  useIsModuleEnabled: vi.fn(),
}));

// Mock the MarkdownMessage component
vi.mock('./MarkdownMessage', () => ({
  MarkdownMessage: ({ content }: { content: string }) => <div>{content}</div>,
}));

const mockUseIsModuleEnabled = vi.mocked(useIsModuleEnabled);

describe('ChatBetaWarningBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when feature flag is disabled', () => {
    mockUseIsModuleEnabled.mockReturnValue(false);

    render(<ChatBetaWarningBanner />);

    expect(screen.queryByTestId('chat-beta-warning')).not.toBeInTheDocument();
  });

  it('should show warning banner initially when feature is enabled', () => {
    mockUseIsModuleEnabled.mockReturnValue(true);

    render(<ChatBetaWarningBanner />);

    expect(screen.getByTestId('chat-beta-warning')).toBeInTheDocument();
    expect(
      screen.getByText(/This Risk Management AI assistant is in beta/)
    ).toBeInTheDocument();
  });

  it('should allow user to dismiss warning banner manually', async () => {
    mockUseIsModuleEnabled.mockReturnValue(true);
    const user = userEvent.setup();

    render(<ChatBetaWarningBanner />);

    // Click dismiss button
    const dismissButton = screen.getByLabelText('Dismiss beta warning');
    await user.click(dismissButton);

    // Banner should be hidden
    expect(screen.queryByTestId('chat-beta-warning')).not.toBeInTheDocument();
  });

  it('should remain hidden once dismissed', async () => {
    mockUseIsModuleEnabled.mockReturnValue(true);
    const user = userEvent.setup();

    const { rerender } = render(<ChatBetaWarningBanner />);

    // Dismiss the warning
    const dismissButton = screen.getByLabelText('Dismiss beta warning');
    await user.click(dismissButton);

    expect(screen.queryByTestId('chat-beta-warning')).not.toBeInTheDocument();

    // Re-render the component and confirm it stays hidden
    rerender(<ChatBetaWarningBanner />);
    expect(screen.queryByTestId('chat-beta-warning')).not.toBeInTheDocument();
  });
});
