import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock the style module
vi.mock('./style.module.scss', () => ({
  default: {
    header: 'header',
    headerTitle: 'headerTitle',
    headerButtons: 'headerButtons',
    headerButton: 'headerButton',
  },
}));

// Mock the icons
vi.mock('@untitled-ui/icons-react', () => ({
  Plus: function Plus() {
    return 'PlusIcon';
  },
  X: function X() {
    return 'XIcon';
  },
  Browser: function Browser() {
    return 'BrowserIcon';
  },
}));

import { ChatHeader } from './ChatHeader';

describe('ChatHeader', () => {
  it('renders with the header title', () => {
    const mockOnNewChat = vi.fn();
    const mockOnClose = vi.fn();

    render(<ChatHeader onNewChat={mockOnNewChat} onClose={mockOnClose} />);

    const headerTitle = screen.getByText('AI Assistant');
    expect(headerTitle).toBeInTheDocument();
  });

  it('renders new chat, browser, and close buttons', () => {
    const mockOnNewChat = vi.fn();
    const mockOnClose = vi.fn();

    render(<ChatHeader onNewChat={mockOnNewChat} onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);

    // Find buttons by their testId
    const newChatButton = screen.getByTestId('new-chat-button');
    const browserButton = screen.getByTestId('browser-button');
    const closeButton = screen.getByTestId('close-chat-button');

    expect(newChatButton).toBeInTheDocument();
    expect(browserButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();

    // Verify header structure
    const headerButtonsContainer = screen.getByTestId('chat-header-buttons');
    expect(headerButtonsContainer).toBeInTheDocument();
  });

  it('calls onNewChat when the new chat button is clicked', async () => {
    const mockOnNewChat = vi.fn();
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<ChatHeader onNewChat={mockOnNewChat} onClose={mockOnClose} />);

    // Find the new chat button by testId
    const newChatButton = screen.getByTestId('new-chat-button');
    await user.click(newChatButton);

    expect(mockOnNewChat).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', async () => {
    const mockOnNewChat = vi.fn();
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(<ChatHeader onNewChat={mockOnNewChat} onClose={mockOnClose} />);

    // Find the close button by testId
    const closeButton = screen.getByTestId('close-chat-button');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnNewChat).not.toHaveBeenCalled();
  });
});
