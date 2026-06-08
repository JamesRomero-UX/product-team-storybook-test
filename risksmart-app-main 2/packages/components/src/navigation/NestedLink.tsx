import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import type { FC } from 'react';
import { NavLink, useLocation, useMatches } from 'react-router';

import type { CountRenderer } from './Count';
import RadioButton from './RadioButton';

interface Props {
  item: SideNavigationProps.Link & { count?: string };
  renderCount?: CountRenderer;
  index: number;
  length: number;
}

const NestedLink: FC<Props> = ({ item, renderCount, index, length }) => {
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
    <li className={'group'}>
      <NavLink
        to={item.href || ''}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        end
        className={
          'flex items-center text-white no-underline h-[40px] overflow-hidden'
        }
      >
        <RadioButton isActive={hasMatch} index={index} length={length} />

        <span
          className={`transition duration-200 px-4 p-3 flex items-center justify-stretch w-full rounded-md text-sm group-hover:bg-navy_light`}
        >
          <span className={'grow'}>{item.text}</span>
          {item.count &&
            renderCount?.({
              isActive: hasMatch,
              countName: item.count,
            })}
        </span>
      </NavLink>
    </li>
  );
};

export default NestedLink;
