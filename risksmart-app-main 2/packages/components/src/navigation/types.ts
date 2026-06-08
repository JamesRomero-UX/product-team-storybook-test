import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { Context, JSX } from 'react';

import type { CountRenderer } from './Count';
import type { NavItemWithIcon } from './NavItemWithIcon';

export interface Props {
  setNavigationOpen: (open: boolean) => void;
  navigationOpen: boolean;
  logoutUrl: string;
  navItems: NavItemWithIcon[];
  renderCount?: CountRenderer;
  customLogoUrl?: () => Promise<string>;
  authContext?: Context<Auth0ContextInterface>;
  showEntitySelector?: boolean;
  entityFilter?: string[] | undefined;
  onEntityChange?: (entityId: string | undefined) => void;
  entityOptions?: { value: string | undefined; label: string }[];
}

export interface Icon {
  icon?: JSX.Element;
}
