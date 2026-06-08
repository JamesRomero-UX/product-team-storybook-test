import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';

import { Item } from './Item';
import type { Icon } from './types';

export interface SectionGroupProps {
  item: SideNavigationProps.SectionGroup & Icon;
}
export const SectionGroup = ({ item }: SectionGroupProps) => {
  return <Item>{item.title}</Item>;
};
