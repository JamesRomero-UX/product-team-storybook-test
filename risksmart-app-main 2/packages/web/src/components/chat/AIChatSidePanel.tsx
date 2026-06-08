import { useEffectEvent } from '@floating-ui/react/utils';
import { Browser, Plus } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import { type FC, useEffect, useState } from 'react';

import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatOptions } from '@/components/chat/ChatOptions';
import { useChatService } from '@/components/chat/chatService';
import { useChatMessaging } from '@/components/chat/hooks/useChatMessaging';
import { useChatOptions } from '@/components/chat/hooks/useChatOptions';
import { useChatSession } from '@/components/chat/hooks/useChatSession';
import { useChatStore } from '@/components/chat/useChatStore';
import { AISidePanelHeader } from '@/components/side-panel/ai/AISidePanelHeader';
import { SidePanelContainer } from '@/components/side-panel/SidePanelContainer';
import type { SidePanelState } from '@/components/side-panel/useSidePanelStore';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';

import styles from './style.module.scss';

let restartChat = false;

useSidePanelStore.subscribe(
  (state: SidePanelState, prevState: SidePanelState) => {
    if (state.key !== prevState.key) {
      restartChat = true;
    }
  }
);

export const AIChatSidePanel: FC = () => {
  const {
    clearMessages,
    clearOptions,
    setSessionId,
    setSessionInitialized,
    sessionId,
    isLoading,
    isInitialising,
    messages,
    options,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');

  useChatSession();

  // Handle message sending
  const { sendMessage } = useChatMessaging();

  // Get chat service for session management
  const { clearSession } = useChatService();

  useChatOptions(sendMessage);

  function handleNewChat() {
    clearMessages();
    clearOptions();
    clearSession(); // Clear the active session from socket provider
    setSessionId(null);
    setSessionInitialized(false);
  }

  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading || isInitialising || !sessionId) {
      return;
    }

    setInputValue(''); // Clear input only after validation passes

    await sendMessage(userMessage);
  };

  const startANewChat = useEffectEvent(() => {
    handleNewChat();
  });

  useEffect(() => {
    if (restartChat) {
      startANewChat();

      restartChat = false;
    }
  }, [startANewChat]);

  return (
    <SidePanelContainer
      header={
        <AISidePanelHeader
          toolbarButtons={[
            <button onClick={handleNewChat} title={'New chat'} key={'new-chat'}>
              <Plus />
            </button>,
            <button
              onClick={() => {
                /* TODO: implement browse history */
              }}
              title={'Browse history'}
              key={'browse'}
            >
              <Browser />
            </button>,
          ]}
        ></AISidePanelHeader>
      }
      content={
        <div className={clsx(styles.chatPanel, 'overflow-y-hidden')}>
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            isInitialising={isInitialising}
          />
          <ChatOptions options={options} />
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            isLoading={isLoading || isInitialising}
          />
        </div>
      }
    ></SidePanelContainer>
  );
};
