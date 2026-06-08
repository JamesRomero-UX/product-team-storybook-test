import type { FC } from 'react';

import styles from './style.module.scss';
import type { ChatOption } from './types';

interface ChatOptionsProps {
  options: ChatOption[];
}

export const ChatOptions: FC<ChatOptionsProps> = ({ options }) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className={styles.optionsContainer} data-testid={'chat-options'}>
      <h4 className={styles.optionsTitle}>
        {'Or select one of these options'}
      </h4>
      <div className={styles.optionsList}>
        {options.map((option) => (
          <button
            key={option.id}
            className={styles.optionButton}
            onClick={option.action}
            data-testid={`chat-option-${option.id}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
