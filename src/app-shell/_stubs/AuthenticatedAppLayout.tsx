// Stub for `src/layouts/AuthenticatedAppLayout` from packages/web.
//
// The production AuthenticatedAppLayout composes Navigation + GlobalHeader +
// AppLayout + SidePanel + tools-mode swappers (HelpPanel / NotificationsList /
// Wizard / ChangeRequestLevels / AI assistant). It also pulls navItems from
// useNavItems(), which we already stub.
//
// In Storybook the only piece that matters for prototyping is:
//   - Navigation (left rail)        ← must match what works in the SideNavigation story
//   - GlobalHeader (top bar)
//   - Content area (children)
//
// This stub strips the rest. It uses RiskSmartNavigation (the production
// custom Navigation) directly — same code path as the working
// "Cloudscape Reference / SideNavigation / RiskSmart with Icons (Live App)"
// story — so the active-state matching, hover, expand/collapse and visual
// chrome all work correctly.
//
// We bypass useNavMenuStore (zustand store with side effects) and the
// AppLayout-driven tools panel: those make sense in the live app but
// produce inconsistent results in Storybook where their state isn't
// driven by real navigation.

import { GlobalHeader } from '@risksmart-app/components/src/global-header/GlobalHeader';
// eslint-disable-next-line import/no-unresolved
// @ts-expect-error — alias resolves at runtime via vite.config.ts
import RiskSmartNavigation from '@risksmart-app/components/navigation';
import clsx from 'clsx';
import { type FC, type ReactNode, useState } from 'react';

import { RISKSMART_NAV_ITEMS_WITH_ICONS } from '../_nav-items';

type Props = {
  children: ReactNode;
  panelContent?: ReactNode;
  globalHeader?: ReactNode;
};

export const AuthenticatedAppLayout: FC<Props> = ({
  children,
  globalHeader,
}) => {
  const [navigationOpen, setNavigationOpen] = useState(true);

  return (
    <div
      className={clsx(
        'grid overflow-hidden h-screen transition-all duration-300 ease-out',
        navigationOpen
          ? 'grid-cols-[300px_1fr] grid-rows-[53px_calc(100vh-53px)]'
          : 'grid-cols-[68px_1fr] grid-rows-[53px_calc(100vh-53px)]'
      )}
    >
      {/* Left rail — Navigation spans both rows */}
      <div className={'row-span-2 col-start-1 col-end-2'}>
        <RiskSmartNavigation
          navigationOpen={navigationOpen}
          setNavigationOpen={setNavigationOpen}
          navItems={RISKSMART_NAV_ITEMS_WITH_ICONS}
          logoutUrl={'/logout'}
        />
      </div>

      {/* Top bar */}
      <div
        className={clsx(
          'row-start-1 row-end-2 col-start-2 col-end-3',
          'max-w-[calc(100vw-var(--navigation-width,300px))]',
          'transition-width duration-300 ease-out'
        )}
      >
        {globalHeader || <GlobalHeader />}
      </div>

      {/* Content */}
      <div
        className={clsx(
          'row-start-2 row-end-3 col-start-2 col-end-3',
          'overflow-y-auto'
        )}
      >
        <div className={'flex-grow'}>{children}</div>
      </div>
    </div>
  );
};

export default AuthenticatedAppLayout;
