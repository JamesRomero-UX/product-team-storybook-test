import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';

import type { CountRenderer } from './Count';
import { NavItems } from './NavItems';

export const SubItems = ({
  item,
  renderCount,
}: {
  item: SideNavigationProps.Section;
  renderCount?: CountRenderer;
}) => {
  return (
    <ul className={'pt-2 pl-4 text-sm list-none'}>
      <NavItems items={item.items} isChild={true} renderCount={renderCount} />
    </ul>
  );
};
