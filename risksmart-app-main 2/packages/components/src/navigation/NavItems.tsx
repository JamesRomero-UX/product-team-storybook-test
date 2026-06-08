import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import { useState } from 'react';

import type { CountRenderer } from './Count';
import { navItemTypeReducer } from './navItemReducer';

export const NavItems = ({
  items,
  isChild,
  collapsed,
  renderCount,
}: {
  items: Readonly<SideNavigationProps.Item[]>;
  isChild?: boolean;
  collapsed?: boolean;
  renderCount?: CountRenderer;
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const onSectionClick = (section: string | null) => {
    if (expandedSection === section) {
      setExpandedSection(null);

      return;
    }

    setExpandedSection(section);
  };

  return items.map((item, index) => (
    <div
      key={`list-item-${index}`}
      className={'box-border flex flex-col w-full'}
    >
      {navItemTypeReducer({
        index,
        items,
        item,
        isChild,
        collapsed,
        renderCount,
        expandedSection,
        onSectionClick,
      })}
    </div>
  ));
};
