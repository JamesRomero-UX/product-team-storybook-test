import { act, getByRole, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { AIChatSidePanel } from '@/components/chat/AIChatSidePanel';
import type { ChatOption } from '@/components/chat/types';
import type { ChatMessage } from '@/components/chat/useChatStore';

let sessionId = '';
const messages: ChatMessage[] = [];
const options: ChatOption[] = [];
let isLoading = false;
let isInitialising = false;

vi.mock('@/components/chat/useChatStore', () => ({
  useChatStore: vi.fn(() => ({
    clearMessages: vi.fn(() => (messages.length = 0)),
    clearOptions: vi.fn(() => (options.length = 0)),
    setSessionId: vi.fn((id: string) => (sessionId = id)),
    setSessionInitialized: vi.fn(
      (initialized: boolean) => (isInitialising = initialized)
    ),
    sessionId,
    isLoading,
    isInitialising,
    messages,
    options,
  })),
}));

// Just need a function to pass, the implementation is not required.
function func() {
  console.log('');
}

const clearSession = vi.fn();

vi.mock('@/components/chat/chatService', () => ({
  useChatService: vi.fn(() => ({
    clearSession,
  })),
}));

let passedOptions: ChatOption[] = [];

vi.mock('@/components/chat/ChatOptions', () => ({
  ChatOptions: ({ options }: { options: ChatOption[] }) => {
    passedOptions = options;

    return <div id={'chat-options'}></div>;
  },
}));

vi.mock('@/components/chat/ChatInput', () => ({
  ChatInput: ({
    value,
    onSend,
    onChange,
    isLoading,
  }: {
    value: string;
    onSend: () => void;
    onChange: (value: string) => void;
    isLoading: boolean;
  }) => {
    return (
      <div id={'chat-input'} data-loading={isLoading.toString()}>
        <input
          type={'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button onClick={onSend}>{'Send'}</button>
      </div>
    );
  },
}));

let passedMessages: ChatMessage[] = [];

vi.mock('@/components/chat/ChatMessages', () => ({
  ChatMessages: ({
    messages,
    isLoading,
    isInitialising,
  }: {
    messages: ChatMessage[];
    isLoading: boolean;
    isInitialising: boolean;
  }) => {
    passedMessages = messages;

    return (
      <div
        id={'chat-messages'}
        data-loading={isLoading.toString()}
        data-initialising={isInitialising.toString()}
      ></div>
    );
  },
}));

let sentMessage: string | undefined = undefined;
vi.mock('@/components/chat/hooks/useChatMessaging', () => ({
  useChatMessaging: vi.fn(() => ({
    sendMessage: (message: string) => (sentMessage = message),
  })),
}));

describe('AIChatSidePanel', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    messages.length = 0;
    options.length = 0;

    passedOptions.length = 0;
    passedMessages.length = 0;
  });

  it('should render all of the required panels', () => {
    render(<AIChatSidePanel />);

    expect(document.getElementById('chat-options')).toBeInTheDocument();
    expect(document.getElementById('chat-input')).toBeInTheDocument();
    expect(document.getElementById('chat-messages')).toBeInTheDocument();
  });

  describe('chat input', () => {
    it.each([
      {
        description: 'the input is empty',
        typedValue: '',
        newSessionId: '123',
        initialising: false,
        loading: false,
      },
      {
        description: 'the session ID is not set',
        typedValue: 'Something',
        newSessionId: '',
        initialising: false,
        loading: false,
      },
      {
        description: 'the chat store is initialising',
        typedValue: 'Something',
        newSessionId: '123',
        initialising: true,
        loading: false,
      },
      {
        description: 'the chat is loading',
        typedValue: 'Something',
        newSessionId: '123',
        initialising: false,
        loading: true,
      },
    ])(
      'should not attempt to send the message when $description',
      async ({ newSessionId, typedValue, initialising, loading }) => {
        sessionId = newSessionId;
        isInitialising = initialising;
        isLoading = loading;

        render(<AIChatSidePanel />);

        await act(async () => {
          const inputArea = document.getElementById('chat-input')!;

          if (typedValue) {
            await user.type(getByRole(inputArea, 'textbox'), typedValue);
          }

          getByRole(inputArea, 'button').click();
        });

        expect(sentMessage).toBeUndefined();
      }
    );

    it('should trim and submit the message when there is a message, it is not loading, it is not initiating and there is a session Id', async () => {
      sessionId = '123';
      isInitialising = false;
      isLoading = false;

      render(<AIChatSidePanel />);

      await act(async () => {
        const inputArea = document.getElementById('chat-input')!;

        await user.type(getByRole(inputArea, 'textbox'), '   Something   ');
        getByRole(inputArea, 'button').click();
      });

      expect(sentMessage).toBe('Something');
    });

    it.each([
      {
        description: 'chat is loading',
        loading: true,
        initialising: false,
      },
      {
        description: 'chat is initialising',
        loading: false,
        initialising: true,
      },
    ])(
      'should show it is loading when $description',
      ({ loading, initialising }) => {
        isInitialising = initialising;
        isLoading = loading;

        render(<AIChatSidePanel />);

        const chatInput = document.getElementById('chat-input')!;

        expect(chatInput.dataset.loading).toBe('true');
      }
    );
  });

  describe('chat options', () => {
    it('should pass all of the chat options through to the chat options section', () => {
      options.push({
        id: '123',
        label: 'test',
        action: func,
      });

      render(<AIChatSidePanel />);

      expect(passedOptions).toBe(options);
      expect(document.getElementById('chat-options')).toBeInTheDocument();
    });
  });

  describe('side panel header', () => {
    it('should reset the chat when a new chat is requested', () => {
      messages.push({
        id: '123',
        content: 'A message',
        timestamp: new Date(),
        isUser: false,
      });
      options.push({
        id: '321',
        label: 'An option',
        action: func,
      });
      sessionId = '111';
      isInitialising = true;

      render(<AIChatSidePanel />);

      screen.getByTitle('New chat').click();

      expect(messages.length).toBe(0);
      expect(options.length).toBe(0);
      expect(sessionId).toBe(null);
      expect(isInitialising).toBe(false);
    });
  });

  describe('chat messages', () => {
    it('should pass the properties through to the message pane', () => {
      messages.push({
        id: '123',
        content: 'A message',
        timestamp: new Date(),
        isUser: false,
      });
      isLoading = true;
      isInitialising = true;

      render(<AIChatSidePanel />);

      const chatPane = document.getElementById('chat-messages')!;

      expect(passedMessages).toBe(messages);

      expect(chatPane.dataset.loading).toBe('true');
      expect(chatPane.dataset.initialising).toBe('true');
    });
  });
});
