import { Browser, Plus, X } from '@untitled-ui/icons-react';
import type { FC } from 'react';

import styles from './style.module.scss';

interface ChatHeaderProps {
  onNewChat: () => void;
  onClose: () => void;
}

export const ChatHeader: FC<ChatHeaderProps> = ({ onNewChat, onClose }) => {
  return (
    <div className={styles.header} data-testid={'chat-header'}>
      <div className={styles.headerTitle}>
        <h3>{'AI Assistant'}</h3>
      </div>
      <div className={styles.headerButtons} data-testid={'chat-header-buttons'}>
        <button
          className={styles.headerButton}
          onClick={onNewChat}
          data-testid={'new-chat-button'}
        >
          <Plus />
        </button>
        <button
          className={styles.headerButton}
          onClick={() => {
            /* TODO: Add browser functionality */
          }}
          data-testid={'browser-button'}
        >
          <Browser />
        </button>
        <button
          className={styles.headerButton}
          onClick={onClose}
          data-testid={'close-chat-button'}
        >
          <X />
        </button>
      </div>
    </div>
  );
};
