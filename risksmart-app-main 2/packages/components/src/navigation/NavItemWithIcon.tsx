import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import type { JSX } from 'react';

export type NavItem = SideNavigationProps.Item;

export type NavItemWithIcon = SideNavigationProps.Item & {
  icon?: JSX.Element;
  count?: string;
};
