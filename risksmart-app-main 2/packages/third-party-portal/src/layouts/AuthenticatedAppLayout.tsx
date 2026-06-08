import { AppLayout } from '@risk-smart/themed-cloudscape-components';
import { UserMenu } from '@risksmart-app/components/src/global-header/global-actions/user-menu/UserMenu';
import { GlobalHeader } from '@risksmart-app/components/src/global-header/GlobalHeader';
import Navigation from '@risksmart-app/components/src/navigation';
import { useNavMenuStore } from '@risksmart-app/components/src/navigation/useNavMenuStore';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import { ThirdPartyAuth0Context } from 'src/providers/ThirdPartyAuth0Context';
import { logoutUrl } from 'src/routes';
import { useNavItems } from 'src/routes/useNavItems';

import styles from './style.module.scss';

interface Props {
  children: ReactNode;
  panelContent?: ReactNode;
}

export const AuthenticatedAppLayout: FC<Props> = ({ children }) => {
  const { isNavigationOpen, setNavigationOpen } = useNavMenuStore();

  const navigationWidth = isNavigationOpen ? 300 : 68;
  const maxContentWidth = 1440;
  const navItems = useNavItems();

  // TODO check `toolsHide` is still needed in UIv3
  // Using the `toolsHide` prop causes the UI to jump, using `visibility: hidden` instead
  return (
    <div
      className={clsx(
        styles.layout,
        'App',
        styles.hideTools,
        'grid grid-rows-[53px_calc(100vh-53px)] overflow-hidden h-screen transition-all duration-300 ease-out print:hidden z-50',
        isNavigationOpen ? 'grid-cols-[300px,auto]' : 'grid-cols-[68px,auto]'
      )}
    >
      <div className={'row-span-1 col-start-1 col-end-2'}>
        <Navigation
          navigationOpen={isNavigationOpen}
          setNavigationOpen={setNavigationOpen}
          logoutUrl={logoutUrl()}
          navItems={navItems}
          authContext={ThirdPartyAuth0Context}
        />
      </div>
      <div className={'row-start-1 row-end-2 col-start-2 col-end-3'}>
        {
          <GlobalHeader>
            <UserMenu
              logoutUrl={'/logout'}
              authContext={ThirdPartyAuth0Context}
            />
          </GlobalHeader>
        }
      </div>
      <div
        className={clsx(
          'row-start-2 row-end-3 col-start-2 col-end-3',
          'overflow-y-scroll no-scrollbar transition-all duration-300 flex-1 flex flex-col'
        )}
      >
        <AppLayout
          headerVariant={'high-contrast'}
          content={<div className={'flex h-screen'}>{children}</div>}
          maxContentWidth={maxContentWidth}
          disableContentPaddings
          navigationOpen={false}
          onNavigationChange={() => {
            // Do nothing. Setting just to avoid warning in console
          }}
          navigationHide={true}
          toolsWidth={350}
          toolsHide={false}
          navigationWidth={navigationWidth}
        />
      </div>
    </div>
  );
};
