import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import { FileQuestion02 } from '@untitled-ui/icons-react';
import type { JSX } from 'react';

export type NavItem = SideNavigationProps.Item;

export type NavItemWithIcon = SideNavigationProps.Item & {
  icon?: JSX.Element;
};

export const useNavItems = (): SideNavigationProps.Item[] => {
  const home: NavItemWithIcon = {
    type: 'link',
    href: '/',
    text: 'Questionnaires',
    icon: <FileQuestion02 />,
  };

  return [home];
};
