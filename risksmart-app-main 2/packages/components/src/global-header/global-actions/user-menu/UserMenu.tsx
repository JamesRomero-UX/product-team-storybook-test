import type { Auth0ContextInterface } from '@auth0/auth0-react';
import { useAuth0 } from '@auth0/auth0-react';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import type { Context, FC } from 'react';
import { useState } from 'react';

import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  hasuraClaimsNamespace,
  hasuraDefaultRole,
  logo,
} from '../../../rbac/jwt';
import { ChevronIcon } from './ChevronIcon';
import { MenuTrigger } from './MenuTrigger';
import { UserAvatar } from './UserAvatar';
import { UserInfo } from './UserInfo';
import UserMenuPopup from './UserMenuPopup';

interface Props {
  logoutUrl: string;
  customLogoUrl?: () => Promise<string>;
  authContext?: Context<Auth0ContextInterface>;
}

export const UserMenu: FC<Props> = ({
  logoutUrl,
  customLogoUrl,
  authContext,
}) => {
  const { isLoading, user, loginWithRedirect } = useAuth0(authContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if we have a custom logo to display
  const userLogo = user?.[hasuraClaimsNamespace][logo];
  const organizationName = user?.claims_organization_name;
  const username = user?.claims_username || 'User';

  const containerRef = useClickOutside<HTMLDivElement>(
    () => setIsMenuOpen(false),
    isMenuOpen
  );

  const { width } = containerRef.current?.getBoundingClientRect() || {
    width: 0,
  };

  return (
    <div className={'flex justify-start min-w-[200px]'} ref={containerRef}>
      {isLoading ? (
        <div className={'w-full flex items-center justify-center'}>
          <Spinner size={'normal'} variant={'disabled'} />
        </div>
      ) : (
        <div className={'flex items-center justify-end'}>
          <MenuTrigger onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={'flex gap-4'}>
              <UserAvatar username={username} />
              <UserInfo
                primaryText={username}
                secondaryText={organizationName}
              />
            </div>
            <div className={'pl-4'}>
              <ChevronIcon isMenuOpen={isMenuOpen} />
            </div>
          </MenuTrigger>

          <div
            className={`fixed top-[53px] transition-all ${isMenuOpen ? 'h-full opacity-100' : 'h-0 opacity-0'} z-[949] overflow-hidden`}
            style={{ width }}
          >
            <UserMenuPopup
              logoutUrl={logoutUrl}
              logoKey={userLogo}
              customLogoUrl={customLogoUrl}
              role={user?.[hasuraClaimsNamespace][hasuraDefaultRole]}
              handleOrgSwitch={() => loginWithRedirect()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
