import type { FC } from 'react';
import type { KeyboardEvent } from 'react';

import styles from './style.module.scss';
import { StyledInput } from './StyledInput';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
}) => {
  const maxLength = 1000;
  const currentLength = value.length;
  const percentage = (currentLength / maxLength) * 100;

  // Determine character limit style based on percentage
  const getCharacterLimitClass = () => {
    if (percentage >= 95) {
      return `${styles.characterLimit} ${styles.danger}`;
    }
    if (percentage >= 80) {
      return `${styles.characterLimit} ${styles.warning}`;
    }

    return styles.characterLimit;
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.inputContainer} data-testid={'chat-input-container'}>
      <StyledInput
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyPress}
        onSend={onSend}
        placeholder={'Type your message...'}
        disabled={isLoading}
        isLoading={isLoading}
        maxLength={maxLength}
      />
      <div className={getCharacterLimitClass()}>
        {currentLength}
        {'/'}
        {maxLength} {'characters'}
      </div>
      <div className={styles.footerText}>
        <div>
          {'AI can make mistakes. Check important info. Privacy Policy Legal'}
          {'Notice'}
        </div>
        <div>{'Copyright © 2025 Ai Chat. All rights reserved.'}</div>
      </div>
    </div>
  );
};
