import { useQuery } from '@apollo/client';
import { useKnockFeed } from '@knocklabs/react';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import ContentLayout from '@risk-smart/themed-cloudscape-components/content-layout';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { GlobalEntityPicker } from '@risksmart-app/components/src/global-header/global-actions/global-entity-picker/GlobalEntityPicker';
import { SystemActions } from '@risksmart-app/components/src/global-header/global-actions/SystemActions';
import { UserMenu } from '@risksmart-app/components/src/global-header/global-actions/user-menu/UserMenu';
import { GlobalHeader } from '@risksmart-app/components/src/global-header/GlobalHeader';
import PageHeader from '@risksmart-app/components/src/page-header';
import { useBaseTracking } from '@risksmart-app/components/src/segment';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { colours } from '@risksmart-app/components/src/utils/colours';
import { GetEntitiesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { ErrorBoundary } from '@sentry/react';
import type { ParseKeys } from 'i18next';
import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { AIChatSidePanel } from '@/components/chat/AIChatSidePanel';
import { useChatStore } from '@/components/chat/useChatStore';
import { I18nSummaryHelpContent } from '@/components/help-panel/SummaryHelpContent';
import { useHelpStore } from '@/components/help-panel/useHelpStore';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';
import { useGetBreadcrumbLabelByNodeType } from '@/hooks/useGetBreadcrumbLabelByNodeType';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { logoutUrl } from '@/utils/urls';

import { AuthenticatedAppLayout } from './AuthenticatedAppLayout';
import { buildEntityTree } from './buildEntityTree';

type Meta = {
  /** Used to set `window.title` where the page title itself contains sensitive information */
  title?: string;
  /** Icon to show next to title */
  icon?: ReactNode;
};

interface Props {
  title?: string;
  /** @deprecated Use {@link Props.meta} instead */
  pageTitle?: string;
  meta?: Meta;
  actions?: ReactNode;
  children?: ReactNode | ReactNode[];
  counter?: string;
  secondary?: ReactNode;
  panelContent?: ReactNode;
  protected?: boolean;
  helpTranslationKey?: ParseKeys<'common'>;
}

const PageLayout: FC<Props> = ({
  title,
  meta,
  pageTitle,
  counter,
  actions,
  secondary,
  panelContent,
  protected: isProtected = true,
  children,
  helpTranslationKey,
}) => {
  useBaseTracking();
  const [toolsContent, setToolsContent] = useTools();

  // Chat store for managing chat panel state
  const { isOpen: isChatOpen, setIsOpen: setChatOpen } = useChatStore();

  // Entity selector setup
  const showEntitySelector = useIsModuleEnabled('enterprise_risk');
  const { data: entities } = useQuery(GetEntitiesDocument);
  const entityNodes = useMemo(
    () => buildEntityTree(entities?.entity ?? []),
    [entities],
  );

  const { setContentId, getHasHelpContent } = useHelpStore();

  const toggleHelp = () => {
    setContentId(null);
    const newToolsContent = toolsContent === 'help' ? undefined : 'help';
    setToolsContent(newToolsContent);
  };

  const toggleNotifications = () => {
    setContentId(null);
    setToolsContent(
      toolsContent === 'notifications' ? undefined : 'notifications'
    );
  };

  const {
    isOpen: isSidePanelOpen,
    close: closeSidePanel,
    open: openSidePanelWith,
    key: sidePanelKey,
  } = useSidePanelStore();

  const handleToggleChat = () => {
    if (isSidePanelOpen && sidePanelKey === 'chat') {
      closeSidePanel();
    } else {
      openSidePanelWith(
        'chat',
        <AIChatSidePanel></AIChatSidePanel>,
        false,
        true
      );
    }
  };

  const {
    hasPermission: hasUpdateTaxonomyPermission,
    loading: isLoadingUpdateTaxonomyPermission,
  } = useHasPermissionQuery('update:taxonomy');

  const showHelp =
    !isLoadingUpdateTaxonomyPermission &&
    (getHasHelpContent() || hasUpdateTaxonomyPermission);

  const isChatEnabled = useIsModuleEnabled('ai.subModules.chat');

  // Check if notifications are enabled (feature flag + permission)
  const notificationsEnabled = useIsModuleEnabled('notification');
  const {
    hasPermission: canReadNotification,
    loading: isLoadingCanReadNotification,
  } = useHasPermissionQuery('read:notification');
  const canViewNotifications =
    canReadNotification &&
    !isLoadingCanReadNotification &&
    notificationsEnabled;

  // Side panel functionality simplified for now

  // Handle mutual exclusivity between chat and tools
  const prevChatOpen = useRef(isChatOpen);
  const prevToolsContent = useRef(toolsContent);

  useEffect(() => {
    const chatJustOpened = isChatOpen && !prevChatOpen.current;
    const toolsJustOpened = toolsContent && !prevToolsContent.current;

    if (chatJustOpened && toolsContent) {
      // Chat was just opened and tools are open, close tools
      setToolsContent(undefined);
    } else if (toolsJustOpened && isChatOpen) {
      // Tools were just opened and chat is open, close chat
      setChatOpen(false);
    }

    // Update refs
    prevChatOpen.current = isChatOpen;
    prevToolsContent.current = toolsContent;
  }, [isChatOpen, toolsContent, setToolsContent, setChatOpen]);

  const visibleTitle = title || meta?.title || pageTitle;
  const metaTitle = meta?.title || pageTitle || title;

  // Get unread notification count using the same logic as ConnectedCount
  const knock = useKnockFeed();
  const unreadNotificationCount = knock.useFeedStore(
    (state) => state.items.filter((i) => !i.read_at).length
  );

  const page = (
    <>
      <Helmet>
        <title data-amp-mask>{metaTitle}</title>
      </Helmet>
      {helpTranslationKey && (
        <I18nSummaryHelpContent translationKey={helpTranslationKey} />
      )}

      {/* Main content */}
      <div className={'flex-1'}>
        {/* Page Header - below global header */}
        <div
          className={'print:hidden bg-white px-7 py-5 m-0'}
          style={{
            borderBottom: `1px solid ${colours['border-light'].backgroundColor}`,
          }}
        >
          <div className={'flex items-center flex-wrap mx-auto'}>
            <div className={'block w-full'}>
              <SpaceBetween size={'m'}>
                <PageHeader
                  counter={counter}
                  actions={
                    <SpaceBetween direction={'horizontal'} size={'xs'}>
                      {actions}
                    </SpaceBetween>
                  }
                >
                  <SpaceBetween size={'s'} direction={'horizontal'}>
                    {visibleTitle}
                    {meta?.icon}
                  </SpaceBetween>
                </PageHeader>
                {secondary}
              </SpaceBetween>
            </div>
          </div>
        </div>

        <ContentLayout disableOverlap defaultPadding>
          <div className={'py-2'}>
            <ErrorBoundary
              onError={(error) => console.error(error)}
              fallback={
                <Alert header={'Error'} type={'error'}>
                  {'An error has occurred'}
                </Alert>
              }
            >
              <SpaceBetween size={'m'}>{children}</SpaceBetween>
            </ErrorBoundary>
          </div>
        </ContentLayout>
      </div>
    </>
  );

  return isProtected ? (
    <AuthenticatedAppLayout
      panelContent={panelContent}
      globalHeader={
        <GlobalHeader
          getBreadcrumbLabelByNodeType={useGetBreadcrumbLabelByNodeType}
        >
          <SystemActions
            toggleHelp={toggleHelp}
            toolsContent={toolsContent}
            toggleNotifications={toggleNotifications}
            canViewNotifications={canViewNotifications}
            unreadNotificationCount={unreadNotificationCount}
            isChatEnabled={isChatEnabled}
            isChatOpen={isSidePanelOpen}
            showHelp={showHelp}
            handleChatClick={handleToggleChat}
          />

          {showEntitySelector && entityNodes.length > 0 ? (
            <GlobalEntityPicker entityNodes={entityNodes} />
          ) : null}

          <UserMenu logoutUrl={logoutUrl()} />
        </GlobalHeader>
      }
    >
      {page}
    </AuthenticatedAppLayout>
  ) : (
    <>{children}</>
  );
};

export default PageLayout;
