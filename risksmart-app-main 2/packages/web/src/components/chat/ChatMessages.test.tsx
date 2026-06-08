import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the Cloudscape components
vi.mock('@risk-smart/themed-cloudscape-components/space-between', () => ({
  default: ({
    children,
    size,
  }: {
    children: React.ReactNode;
    size: string;
  }) => (
    <div data-testid={'space-between'} data-size={size}>
      {children}
    </div>
  ),
}));

vi.mock('@risk-smart/themed-cloudscape-components/spinner', () => ({
  default: () => <div data-testid={'chat-loading'}>{'Loading spinner'}</div>,
}));

vi.mock('@risk-smart/themed-cloudscape-components/text-content', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={'text-content'}>{children}</div>
  ),
}));

// Mock the MarkdownMessage component
vi.mock('./MarkdownMessage', () => ({
  MarkdownMessage: ({
    content,
    isUser,
  }: {
    content: string;
    isUser: boolean;
  }) => (
    <div data-testid={'markdown-message'} data-is-user={isUser.toString()}>
      {content}
    </div>
  ),
}));

// Mock the ChatBetaWarningBanner component
vi.mock('./ChatBetaWarningBanner', () => ({
  ChatBetaWarningBanner: () => (
    <div data-testid={'chat-beta-warning-banner'}>{'Beta Warning Banner'}</div>
  ),
}));

// Mock the CSS module
vi.mock('./style.module.scss', () => ({
  default: {
    messagesContainer: 'messagesContainer',
    emptyState: 'emptyState',
    message: 'message',
    userMessage: 'userMessage',
    botMessage: 'botMessage',
    messageContent: 'messageContent',
    messageTime: 'messageTime',
    loadingMessage: 'loadingMessage',
  },
}));

import { ChatMessages } from './ChatMessages';

describe('ChatMessages', () => {
  it('renders empty state when no messages are provided', () => {
    render(
      <ChatMessages messages={[]} isLoading={false} isInitialising={false} />
    );

    const emptyState = screen.getByText(
      'Unable to connect to chat service. Please try refreshing the page or contact support if the issue persists.'
    );
    expect(emptyState).toBeInTheDocument();

    // Check that empty state text content exists
    const textContent = screen.getByTestId('text-content');
    expect(textContent).toBeInTheDocument();
  });

  it('renders a loading indicator when isLoading is true', () => {
    render(
      <ChatMessages messages={[]} isLoading={true} isInitialising={false} />
    );

    const spinner = screen.getByTestId('chat-loading');
    expect(spinner).toBeInTheDocument();
  });

  it('renders messages when provided', () => {
    const mockMessages = [
      {
        id: '1',
        content: 'Hello',
        timestamp: new Date('2023-01-01T12:00:00'),
        isUser: true,
      },
      {
        id: '2',
        content: 'Hi there!',
        timestamp: new Date('2023-01-01T12:01:00'),
        isUser: false,
      },
    ];

    render(
      <ChatMessages
        messages={mockMessages}
        isLoading={false}
        isInitialising={false}
      />
    );

    // Check that we have the right number of messages
    const markdownMessages = screen.getAllByTestId('markdown-message');
    expect(markdownMessages).toHaveLength(2);

    // Check user message
    expect(markdownMessages[0]).toHaveTextContent('Hello');
    expect(markdownMessages[0]).toHaveAttribute('data-is-user', 'true');

    // Check bot message
    expect(markdownMessages[1]).toHaveTextContent('Hi there!');
    expect(markdownMessages[1]).toHaveAttribute('data-is-user', 'false');

    // Check timestamps are rendered
    const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timestamps).toHaveLength(2);
  });

  it('renders both messages and loading indicator when both are present', () => {
    const mockMessages = [
      {
        id: '1',
        content: 'Hello',
        timestamp: new Date('2023-01-01T12:00:00'),
        isUser: true,
      },
    ];

    render(
      <ChatMessages
        messages={mockMessages}
        isLoading={true}
        isInitialising={false}
      />
    );

    // Check message is rendered
    const markdownMessage = screen.getByTestId('markdown-message');
    expect(markdownMessage).toHaveTextContent('Hello');

    // Check loading indicator is rendered
    const spinner = screen.getByTestId('chat-loading');
    expect(spinner).toBeInTheDocument();
  });

  it('applies correct CSS classes to user and bot messages', () => {
    const mockMessages = [
      {
        id: '1',
        content: 'Hello',
        timestamp: new Date('2023-01-01T12:00:00'),
        isUser: true,
      },
      {
        id: '2',
        content: 'Hi there!',
        timestamp: new Date('2023-01-01T12:01:00'),
        isUser: false,
      },
    ];

    const { container } = render(
      <ChatMessages
        messages={mockMessages}
        isLoading={false}
        isInitialising={false}
      />
    );

    // Check if user message has the right CSS classes
    const messageContainers = container.querySelectorAll('div.message');
    expect(messageContainers).toHaveLength(2);

    const userMessageContainer = messageContainers[0];
    expect(userMessageContainer).toHaveClass('message');
    expect(userMessageContainer).toHaveClass('userMessage');
    expect(userMessageContainer).not.toHaveClass('botMessage');

    const botMessageContainer = messageContainers[1];
    expect(botMessageContainer).toHaveClass('message');
    expect(botMessageContainer).toHaveClass('botMessage');
    expect(botMessageContainer).not.toHaveClass('userMessage');
  });

  it('shows warning banner when no messages and not loading', () => {
    render(
      <ChatMessages messages={[]} isLoading={false} isInitialising={false} />
    );

    const warningBanner = screen.getByTestId('chat-beta-warning-banner');
    expect(warningBanner).toBeInTheDocument();
  });

  it('shows warning banner when there are messages', () => {
    const mockMessages = [
      {
        id: '1',
        content: 'Hello',
        timestamp: new Date('2023-01-01T12:00:00'),
        isUser: true,
      },
    ];

    render(
      <ChatMessages
        messages={mockMessages}
        isLoading={false}
        isInitialising={false}
      />
    );

    const warningBanner = screen.getByTestId('chat-beta-warning-banner');
    expect(warningBanner).toBeInTheDocument();
  });

  it('shows warning banner when loading', () => {
    render(
      <ChatMessages messages={[]} isLoading={true} isInitialising={false} />
    );

    const warningBanner = screen.getByTestId('chat-beta-warning-banner');
    expect(warningBanner).toBeInTheDocument();
  });

  it('renders an initialising indicator when isInitialising is true', () => {
    render(
      <ChatMessages messages={[]} isLoading={false} isInitialising={true} />
    );

    const initialising = screen.getByRole('img', { name: 'Loading' });
    expect(initialising).toBeInTheDocument();

    // Should not show empty state when initialising
    expect(screen.queryByText('Start a conversation!')).not.toBeInTheDocument();
  });

  it('does not render messages when isInitialising is true', () => {
    const mockMessages = [
      {
        id: '1',
        content: 'Hello',
        timestamp: new Date('2023-01-01T12:00:00'),
        isUser: true,
      },
    ];

    render(
      <ChatMessages
        messages={mockMessages}
        isLoading={false}
        isInitialising={true}
      />
    );

    // Should show initialising indicator
    const initialising = screen.getByRole('img', { name: 'Loading' });
    expect(initialising).toBeInTheDocument();

    // Should not show messages
    expect(screen.queryByTestId('markdown-message')).not.toBeInTheDocument();
  });
});
