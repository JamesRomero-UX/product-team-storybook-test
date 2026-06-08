import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';

import type { CountRenderer } from './Count';
import { Item } from './Item';
import Link from './Link';
import type { Icon } from './types';

export const ExpandableLinkGroup = ({
  item,
  renderCount,
}: {
  item: SideNavigationProps.ExpandableLinkGroup & Icon;
  renderCount?: CountRenderer;
}) => {
  return (
    <Item>
      <Link item={item} renderCount={renderCount} />
    </Item>
  );
};
