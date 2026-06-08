import { Bell01, InfoCircle, Stars02 } from '@untitled-ui/icons-react';
import { useTranslation } from 'react-i18next';

import type { ToolsContent } from '../../tools/useTools';
import { colours } from '../../utils/colours';
import GlobalActionButton from './GlobalActionButton';

interface Props {
  toggleHelp: () => void;
  toolsContent: ToolsContent;
  toggleNotifications: () => void;
  canViewNotifications: boolean;
  unreadNotificationCount: number;
  isChatEnabled: boolean;
  isChatOpen: boolean;
  showHelp?: boolean;
  handleChatClick: () => void;
}

export const SystemActions = ({
  toggleHelp,
  toolsContent,
  toggleNotifications,
  canViewNotifications,
  unreadNotificationCount,
  isChatEnabled,
  isChatOpen,
  showHelp,
  handleChatClick,
}: Props) => {
  const { t } = useTranslation(['common']);

  return (
    <div className={'flex gap-4 justify-center items-center px-6'}>
      {showHelp ? (
        <GlobalActionButton
          icon={<InfoCircle />}
          onClick={toggleHelp}
          ariaLabel={t('actionButton.helpAndInformation')}
          tooltip={t('actionButton.getHelpAndInformation')}
          iconColor={colours['icon-light'].backgroundColor}
          isActive={toolsContent === 'help'}
          data-testid={'global-action-help'}
        />
      ) : null}

      {canViewNotifications ? (
        <GlobalActionButton
          icon={<Bell01 />}
          onClick={toggleNotifications}
          ariaLabel={t('actionButton.viewNotifications')}
          tooltip={t('actionButton.viewYourNotifications')}
          iconColor={colours['icon-light'].backgroundColor}
          badge={
            unreadNotificationCount > 0 ? unreadNotificationCount : undefined
          }
          isActive={toolsContent === 'notifications'}
          data-testid={'global-action-notifications'}
        />
      ) : null}

      {isChatEnabled ? (
        <GlobalActionButton
          icon={<Stars02 />}
          onClick={handleChatClick}
          ariaLabel={t('actionButton.openAiAssistant')}
          tooltip={t('actionButton.openAiAssistant')}
          iconColor={colours['ai-assistant'].backgroundColor}
          isActive={isChatOpen}
          data-testid={'global-action-ai-assistant'}
        />
      ) : null}
    </div>
  );
};
