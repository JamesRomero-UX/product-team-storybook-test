import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import { ChevronDown } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import { useLocation, useMatches } from 'react-router';

import type { CountRenderer } from './Count';
import { Item } from './Item';
import SectionDropdown from './SectionDropdown';
import { SubItems } from './SubItems';
import type { Icon } from './types';

export interface SectionProps {
  item: SideNavigationProps.Section & Icon;
  renderCount?: CountRenderer;
  expandedSection?: string | null;
  onSectionClick?: (section: string | null) => void;
}

export const Section = ({
  item,
  renderCount,
  onSectionClick,
  expandedSection,
}: SectionProps) => {
  const matches = useMatches();
  const location = useLocation();

  const linksInSection = item.items
    .filter((item): item is SideNavigationProps.Link => 'href' in item)
    .map((item) => item.href);

  const matchesUrl =
    matches
      .map((match) => match.pathname)
      .filter((match) => {
        // `/` should only match at top level
        if (location.pathname === '/' && match === '/') {
          return true;
        }
        if (match !== '/') {
          return true;
        }
      })
      .filter((path) => linksInSection.includes(path)).length > 0;

  const isSectionExpanded = expandedSection === item?.text || matchesUrl;

  return (
    <Item>
      <div className={'h-[40px]'}>
        <SectionDropdown
          onClick={() => onSectionClick && onSectionClick(item?.text ?? null)}
          match={isSectionExpanded}
          icon={item.icon}
        >
          <span className={'grow'}>{item.text}</span>
          <div
            className={`flex items-center justify-center h-full transition-transform ease-out ${isSectionExpanded ? 'rotate-180' : 'rotate-0'}`}
          >
            <ChevronDown className={''} />
          </div>
        </SectionDropdown>
      </div>

      <div
        className={`grid transition-all ease-out ${
          isSectionExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div
          className={clsx('overflow-hidden', isSectionExpanded ? '' : 'hidden')}
        >
          <SubItems item={item} renderCount={renderCount} />
        </div>
      </div>
    </Item>
  );
};
