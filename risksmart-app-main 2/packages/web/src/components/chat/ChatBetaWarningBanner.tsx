import Alert from '@risk-smart/themed-cloudscape-components/alert';
import type { FC } from 'react';
import { useState } from 'react';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { MarkdownMessage } from './MarkdownMessage';

export const ChatBetaWarningBanner: FC = () => {
  const [userHasDismissed, setUserHasDismissed] = useState(false);

  // Warning text with markdown formatting
  const warningText = `

  **Beta Feature**

 This Risk Management AI assistant is in beta.

 Responses may be inaccurate or inappropriate, please verify information independently.

 We are not responsible for response accuracy during development.`;

  // Check if the warning banner feature is enabled
  const isWarningEnabled = useIsModuleEnabled('ai.subModules.chat_warning');

  const handleDismiss = () => {
    setUserHasDismissed(true);
  };

  // Don't render if feature flag is disabled or user has dismissed
  if (!isWarningEnabled || userHasDismissed) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Alert
        type={'warning'}
        dismissible={true}
        dismissAriaLabel={'Dismiss beta warning'}
        onDismiss={handleDismiss}
        header={''}
        data-testid={'chat-beta-warning'}
      >
        <MarkdownMessage content={warningText} isUser={false} />
      </Alert>
    </div>
  );
};
