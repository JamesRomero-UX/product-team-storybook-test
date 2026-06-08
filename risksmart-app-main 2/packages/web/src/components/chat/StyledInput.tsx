import { Send03 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

import styles from './StyledInput.module.scss';

interface StyledInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  maxLength?: number;
  'data-testid'?: string;
}

export const StyledInput: FC<StyledInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onSend,
  placeholder,
  disabled = false,
  className = '',
  isLoading = false,
  maxLength = 1000,
  'data-testid': dataTestId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    // Enforce character limit
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const handleSendClick = () => {
    if (onSend && !disabled) {
      onSend();
    }
  };

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // If there's no content, set to minimum height
      if (!value.trim()) {
        textarea.style.height = '44px'; // Single line height
        textarea.style.overflow = 'hidden';

        return;
      }

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight (content height), with min of 44px and max of 200px
      const minHeight = 44;
      const maxHeight = 200;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight)
      );
      textarea.style.height = `${newHeight}px`;

      // Show scrollbar if content exceeds max height
      textarea.style.overflow =
        textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [value]);

  return (
    <div
      className={`${styles.styledInputContainer} ${isLoading ? styles.loading : ''} ${className}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.styledInput}
        data-testid={dataTestId}
        rows={1}
        maxLength={maxLength}
      />
      <button
        type={'button'}
        onClick={handleSendClick}
        disabled={disabled || !value.trim()}
        className={styles.sendButton}
        title={'Send message'}
      >
        <Send03 className={styles.sendIcon} />
      </button>
    </div>
  );
};
