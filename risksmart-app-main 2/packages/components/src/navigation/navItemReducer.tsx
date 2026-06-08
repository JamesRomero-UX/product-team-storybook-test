import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';

import type { CountRenderer } from './Count';
import { Divider } from './Divider';
import { ExpandableLinkGroup } from './ExpandableLinkGroup';
import ItemCollapsed from './ItemCollapsed';
import Link from './Link';
import { LinkGroup } from './LinkGroup';
import NestedLink from './NestedLink';
import { Section } from './Section';
import { SectionGroup } from './SectionGroup';

export const navItemTypeReducer = ({
  index,
  items,
  item,
  isChild,
  collapsed,
  renderCount,
  expandedSection,
  onSectionClick,
}: {
  index: number;
  items: readonly SideNavigationProps.Item[];
  item: SideNavigationProps.Item;
  isChild?: boolean;
  collapsed?: boolean;
  renderCount?: CountRenderer;
  expandedSection?: string | null;
  onSectionClick?: (section: string | null) => void;
}) => {
  switch (item.type) {
    case 'section':
      if (collapsed) {
        return <ItemCollapsed item={item} renderCount={renderCount} />;
      }

      return (
        <Section
          item={item}
          renderCount={renderCount}
          expandedSection={expandedSection}
          onSectionClick={onSectionClick}
        />
      );
    case 'divider':
      return <Divider />;
    case 'expandable-link-group':
      return <ExpandableLinkGroup item={item} renderCount={renderCount} />;
    case 'link':
      if (collapsed) {
        return <ItemCollapsed item={item} renderCount={renderCount} />;
      }

      return isChild ? (
        <NestedLink
          item={item}
          renderCount={renderCount}
          index={index}
          length={items.length}
        />
      ) : (
        <Link item={item} renderCount={renderCount} />
      );
    case 'link-group':
      return <LinkGroup item={item} renderCount={renderCount} />;
    case 'section-group':
      return <SectionGroup item={item} />;
    default:
      return <></>;
  }
};
