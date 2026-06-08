import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import clsx from 'clsx';
import type { FC, JSX } from 'react';
import { NavLink, useLocation, useMatches } from 'react-router';

import type { CountRenderer } from './Count';

export interface LinkProps {
  item: (
    | SideNavigationProps.ExpandableLinkGroup
    | SideNavigationProps.Link
    | SideNavigationProps.LinkGroup
  ) & {
    icon?: JSX.Element;
    count?: string;
  };
  renderCount?: CountRenderer;
}

const Link: FC<LinkProps> = ({ item, renderCount }) => {
  const matches = useMatches();
  const location = useLocation();
  const hasMatch =
    matches
      .map((match) => match.pathname)
      .filter((match) => {
        if (location.pathname === '/' && match === '/') {
          return true;
        }
        if (match !== '/') {
          return true;
        }
      })
      .filter((path) => path === item.href).length > 0;

  return (
    <li className={'list-none px-4 py-1'}>
      <NavLink
        to={item.href || '#'}
        className={({ isActive }) =>
          clsx(
            'transition duration-200 group no-underline px-[10px] py-3 rounded-md flex items-center space-x-4 hover:bg-navy_light',
            isActive
              ? 'text-navy bg-teal hover:text-navy hover:bg-teal'
              : 'text-white'
          )
        }
        children={({ isActive }) => (
          <>
            {item.icon && (
              <span
                className={`w-[24px] h-[24px] relative ${isActive ? 'text-navy' : 'text-teal'}`}
              >
                {item.icon}
              </span>
            )}
            <span className={'grow'}>{item.text}</span>
            {item.count &&
              renderCount?.({
                isActive: hasMatch,
                countName: item.count,
              })}
          </>
        )}
      />
    </li>
  );
};

export default Link;
