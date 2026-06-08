import AppLayout from '@risk-smart/themed-cloudscape-components/app-layout';
import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';
import { GlobalHeader } from '@risksmart-app/components/src/global-header/GlobalHeader';
import Navigation from '@risksmart-app/components/src/navigation';
import { useNavMenuStore } from '@risksmart-app/components/src/navigation/useNavMenuStore';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import clsx from 'clsx';
import { type FC, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';
import ConnectedCount from 'src/components/connected-count';
import type { TCountOptions } from 'src/components/connected-count/ConnectedCount';
import NotificationsList from 'src/components/notifications-list';
import { Wizard } from 'src/components/wizard/Wizard';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';
import { useNavItems } from 'src/routes/useNavItems';

import { ChangeRequestLevels } from '@/components/change-request-levels/ChangeRequestLevels';
import HelpPanel from '@/components/help-panel';
import { SidePanel } from '@/components/side-panel/SidePanel';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';
import { useCustomOrgLogo } from '@/hooks/useCustomOrgLogo';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { logoutUrl } from '@/utils/urls';

import styles from './style.module.scss';

type Props = {
  children: ReactNode;
  panelContent?: ReactNode;
  globalHeader?: ReactNode;
};

export const AuthenticatedAppLayout: FC<Props> = ({
  children,
  panelContent,
  globalHeader,
}) => {
  const { t } = useTranslation(['common']);
  const { isNavigationOpen, setNavigationOpen } = useNavMenuStore();
  const navItems = useNavItems();
  const navigationWidth = isNavigationOpen ? 300 : 68;
  const maxContentWidth = 1440;
  const [toolsContent, setToolsContent, toolsLocationChanged] = useTools();
  const [searchParams, setSearchParams] = useSearchParams();
  const showEntitySelector = useIsModuleEnabled('enterprise_risk');
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { entityIds, setEntityIds } = useEntityFilter();
  const { data: entities } = useGetEntities({ queryArgs: {} });
  const getCustomLogo = useCustomOrgLogo();
  const entityOptions = useMemo(
    () => [
      { label: t('entity.global'), value: undefined },
      ...(entities?.entity
        .map((entity) => ({
          label: entity.Name,
          value: entity.Id,
        })) ?? []),
    ],
    [entities, t]
  );

  const {
    isOpen: isSidePanelOpen,
    close: closeSidePanel,
    isWidePanel,
    locationChanged,
  } = useSidePanelStore();

  let tools: ReactNode | undefined = undefined;
  let toolWidth = 350;
  const toolsType = toolsContent?.split(':')[0];
  const id = toolsContent?.split(':')[1];
  const secondaryId = toolsContent?.split(':')[2];
  switch (toolsType) {
    case 'help':
      tools = <HelpPanel />;
      break;
    case 'notifications':
      tools = <NotificationsList />;
      break;
    case 'page-content':
      tools = panelContent;
      break;
    case 'change-request':
      if (id) {
        tools = (
          <ChangeRequestLevels parentId={id} changeRequestId={secondaryId} />
        );
      }
      break;
    case 'wizard':
      tools = <Wizard />;
      break;
    case 'ai-assistant':
      tools = <HelpPanel />;
      toolWidth = 550;
      break;
    default:
      tools = undefined;
  }

  // Use refs to track previous values to determine what changed
  const prevChatOpen = useRef(isSidePanelOpen);
  const prevToolsContent = useRef(toolsContent);

  // Handle mutual exclusivity between chat and tools
  useEffect(() => {
    const chatJustOpened = isSidePanelOpen && !prevChatOpen.current;
    const toolsJustOpened = toolsContent && !prevToolsContent.current;

    if (chatJustOpened && toolsContent) {
      // Chat was just opened and tools are open, close tools
      setToolsContent(undefined);
    } else if (toolsJustOpened && isSidePanelOpen) {
      // Tools were just opened and chat is open, close chat
      closeSidePanel();
    }

    // Update refs
    prevChatOpen.current = isSidePanelOpen;
    prevToolsContent.current = toolsContent;
  }, [isSidePanelOpen, toolsContent, setToolsContent, closeSidePanel]);

  const location = useLocation();

  useEffect(() => {
    locationChanged();
    toolsLocationChanged(location.pathname);
  }, [location, locationChanged, toolsLocationChanged]);

  // TODO check `toolsHide` is still needed in UIv3
  // Using the `toolsHide` prop causes the UI to jump, using `visibility: hidden` instead
  return (
    <div
      className={clsx(
        'grid grid-rows-[53px_calc(100vh-53px)] overflow-hidden h-screen transition-all duration-300 ease-out print:hidden z-50',
        styles.sidePanel,
        !isSidePanelOpen && styles.sidePanelClosed,
        isSidePanelOpen && isWidePanel && styles.sidePanelWide,
        isSidePanelOpen && !isWidePanel && styles.sidePanelStandard,
        !isNavigationOpen && styles.navigationCollapsed
      )}
    >
      <div className={'row-span-2 col-start-1 col-end-2'}>
        <Navigation
          renderCount={(props) =>
            !trpcEnabled && (
              <ConnectedCount
                {...props}
                countName={props.countName as TCountOptions}
              />
            )
          }
          navItems={navItems}
          logoutUrl={logoutUrl()}
          navigationOpen={isNavigationOpen}
          setNavigationOpen={setNavigationOpen}
          customLogoUrl={getCustomLogo}
          showEntitySelector={showEntitySelector}
          entityOptions={entityOptions}
          entityFilter={entityIds}
          onEntityChange={(entityId: string | undefined) =>
            entityId ? setEntityIds([entityId]) : setEntityIds([])
          }
        />
      </div>
      <div
        className={clsx(
          'row-start-1 row-end-2 col-start-2 col-end-4',
          'max-w-[calc(100vw-var(--navigation-width,300px))]',
          'transition-width duration-300 ease-out'
        )}
      >
        {globalHeader || <GlobalHeader />}
      </div>
      <div
        className={clsx(
          'row-start-2 row-end-3 col-start-2 col-end-3',
          'overflow-y-scroll no-scrollbar transition-all duration-300 flex-1 flex flex-col'
        )}
      >
        <AppLayout
          content={
            <div className={clsx('flex-grow', styles.rsContent)}>
              {children}
            </div>
          }
          maxContentWidth={maxContentWidth}
          disableContentPaddings
          navigationOpen={false}
          onNavigationChange={() => {
            // Do nothing. Setting just to avoid warning in console
          }}
          navigationHide={true}
          toolsWidth={toolWidth}
          tools={tools}
          toolsHide={!toolsContent}
          toolsOpen={!!toolsContent}
          onToolsChange={({ detail }) => {
            if (
              !detail.open &&
              searchParams.get('showRequest') === 'true' &&
              toolsType === 'change-request'
            ) {
              setSearchParams((prev) => {
                prev.set('showRequest', 'false');

                return prev;
              });
            }

            setToolsContent(detail.open ? 'help' : undefined);
          }}
          navigationWidth={navigationWidth}
        />
      </div>
      <aside
        className={
          'overflow-hidden drop-shadow-xl row-start-2 row-end-3 col-start-3 col-end-4'
        }
      >
        <SidePanel />
      </aside>
    </div>
  );
};
