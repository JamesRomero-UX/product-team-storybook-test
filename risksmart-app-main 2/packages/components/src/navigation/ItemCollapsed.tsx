import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import clsx from 'clsx';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useMatches } from 'react-router';

import { useClickOutside } from '../hooks/useClickOutside';
import type { CountRenderer } from './Count';
import type { LinkProps } from './Link';
import type { SectionProps } from './Section';
import type { SectionGroupProps } from './SectionGroup';

type Props =
  | (LinkProps & {
      count?: string;
    })
  | SectionGroupProps
  | SectionProps;
const ItemCollapsed: FC<Props & { renderCount?: CountRenderer }> = ({
  item,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [topPosition, setTopPosition] = useState(0);

  const containerRef = useClickOutside<HTMLLIElement>(
    () => setIsMenuOpen(false),
    isMenuOpen
  );

  // Update position whenever scroll occurs or menu opens
  useEffect(() => {
    const updatePosition = () => {
      const { top } = containerRef.current?.getBoundingClientRect() || {
        top: 0,
      };

      setTopPosition(top + window.scrollY);
    };

    // Update position initially and when menu opens
    updatePosition();

    // Find the scrollable navigation container
    const navContainer = document.getElementById('nav-items-container');
    const closeMenuOnScroll = () => {
      setIsMenuOpen(false);
      updatePosition();
    };

    if (navContainer) {
      navContainer.addEventListener('scroll', closeMenuOnScroll);

      return () => {
        navContainer.removeEventListener('scroll', closeMenuOnScroll);
      };
    }
  }, [isMenuOpen, containerRef]);

  const matches = useMatches();
  const location = useLocation();
  const items = item.type === 'section' ? item.items : null;
  const link = item.type === 'link' ? item : null;

  const linksInSection =
    items
      ?.filter((item): item is SideNavigationProps.Link => item.type === 'link')
      .map((item) => item.href) || [];

  const urlMatches = matches
    .map((match) => match.pathname)
    .filter((match) => {
      if (location.pathname === '/' && match === '/') {
        return true;
      }
      if (match !== '/') {
        return true;
      }
    });

  const hasMatch = Boolean(
    linksInSection?.filter((x) => urlMatches.includes(x))?.filter(Boolean)
      ?.length > 0
  );

  const buttonClassNames =
    'relative border-0 px-[10px] rounded-md h-[40px] flex items-center justify-center cursor-pointer';

  return (
    <li ref={containerRef} className={'list-none px-4 py-1 flex'}>
      {items && (
        <div
          style={{ top: topPosition }}
          className={`fixed left-[70px] pb-3 ml-3 w-[275px] transition-all ease-out z-[1000] ${
            isMenuOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-98 pointer-events-none'
          }`}
        >
          <div
            className={clsx(
              'rounded-[10px] font-sans font-semibold text-xs text-white bg-navy_mid p-3'
            )}
          >
            <ul className={'list-none p-[0px] m-[0px]'}>
              {items
                ?.filter(
                  (item): item is SideNavigationProps.Link =>
                    item.type === 'link'
                )
                .map((item, index) => (
                  <li key={`item-${index}`}>
                    <NavLink
                      to={item.href}
                      className={
                        'block p-3 rounded-md text-white text-[14px] no-underline hover:bg-navy_light'
                      }
                    >
                      {item.text}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {link ? (
        <NavLink
          to={link.href}
          className={({ isActive }) =>
            `${buttonClassNames} ${
              isActive
                ? ' text-navy bg-teal hover:text-navy hover:bg-teal'
                : 'text-teal bg-transparent hover:bg-navy_light'
            }`
          }
        >
          {item.icon}
        </NavLink>
      ) : (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`${buttonClassNames} ${
            hasMatch
              ? 'bg-teal text-navy'
              : 'bg-transparent text-teal hover:bg-navy_light'
          }`}
        >
          {item.icon}
        </button>
      )}
    </li>
  );
};

export default ItemCollapsed;
