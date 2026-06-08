import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import { AISidePanelLoading } from '@/components/side-panel/ai/AISidePanelLoading';

import { ChatBetaWarningBanner } from './ChatBetaWarningBanner';
import { MarkdownMessage } from './MarkdownMessage';
import styles from './style.module.scss';
import { type ChatMessage, useChatStore } from './useChatStore';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isInitialising: boolean;
}

export const ChatMessages: FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  isInitialising,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { currentThinkingStep, streamingMessageId, isStreaming } =
    useChatStore();

  // Auto-scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && messagesContainerRef.current) {
        // Method 1: Scroll the container to the very bottom
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;

        // Method 2: Also use scrollIntoView as backup for smooth effect
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest',
            });
          }
        }, 50);
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading, isInitialising]);

  // Scroll during streaming - using a more conservative approach
  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    // Use requestAnimationFrame for smoother performance instead of setInterval
    let animationFrameId: number;
    let lastScrollHeight = 0;

    const checkAndScroll = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const currentScrollHeight = container.scrollHeight;

        // Only scroll if content height has actually changed
        if (currentScrollHeight !== lastScrollHeight) {
          container.scrollTop = currentScrollHeight;
          lastScrollHeight = currentScrollHeight;
        }
      }

      // Continue checking while streaming
      if (isStreaming) {
        animationFrameId = requestAnimationFrame(checkAndScroll);
      }
    };

    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(checkAndScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isStreaming]);

  return (
    <div
      ref={messagesContainerRef}
      className={styles.messagesContainer}
      data-testid={'chat-messages'}
    >
      <ChatBetaWarningBanner />
      {isInitialising && <AISidePanelLoading></AISidePanelLoading>}
      {!isInitialising && messages.length === 0 ? (
        <div className={styles.emptyState} data-testid={'chat-empty-state'}>
          <TextContent>
            <p>
              {
                'Unable to connect to chat service. Please try refreshing the page or contact support if the issue persists.'
              }
            </p>
          </TextContent>
        </div>
      ) : (
        !isInitialising && (
          <SpaceBetween size={'s'}>
            {messages.map((message) => {
              const isStreamingMessage =
                isStreaming && message.id === streamingMessageId;

              return (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.isSystem
                      ? styles.systemMessage
                      : message.isUser
                        ? styles.userMessage
                        : styles.botMessage
                  }`}
                  data-testid={`chat-message-${
                    message.isSystem ? 'system' : message.isUser ? 'user' : 'ai'
                  }`}
                >
                  <div className={styles.messageContent}>
                    <MarkdownMessage
                      content={message.content}
                      isUser={message.isUser}
                    />
                    {isStreamingMessage && (
                      <span
                        className={styles.streamingDots}
                        data-testid={'streaming-dots'}
                      >
                        <div className={styles.streamingDot}></div>
                        <div className={styles.streamingDot}></div>
                        <div className={styles.streamingDot}></div>
                      </span>
                    )}
                  </div>
                  <div className={styles.messageFooter}>
                    <div className={styles.messageTime}>
                      <TextContent>
                        <small>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </TextContent>
                    </div>
                  </div>
                </div>
              );
            })}
          </SpaceBetween>
        )
      )}
      {isLoading && !isStreaming && (
        <div className={styles.loadingMessage} data-testid={'chat-loading'}>
          <div className={styles.thinkingContainer}>
            <div className={styles.thinkingBubble}>
              <div className={styles.thinkingDot}></div>
              <div className={styles.thinkingDot}></div>
              <div className={styles.thinkingDot}></div>
            </div>
            {currentThinkingStep && (
              <div
                className={styles.thinkingStep}
                data-testid={'thinking-step'}
              >
                {currentThinkingStep}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Invisible element to scroll to */}
      <div
        ref={messagesEndRef}
        style={{ height: '1px', marginBottom: '16px' }}
      />
    </div>
  );
};
