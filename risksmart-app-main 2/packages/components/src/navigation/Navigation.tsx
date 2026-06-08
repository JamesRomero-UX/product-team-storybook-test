import Box from '@risk-smart/themed-cloudscape-components/box';
import { LayoutLeft } from '@untitled-ui/icons-react';
import type { FC } from 'react';

import Logo from './Logo';
import { NavItems } from './NavItems';
import type { Props } from './types';

const Navigation: FC<Props> = ({
  navigationOpen,
  setNavigationOpen,
  navItems,
  renderCount,
}) => {
  const gradientStyle =
    'sticky left-0 right-0 h-7 pointer-events-none z-[1000] -mb-5';

  return (
    <Box>
      <div
        data-testid={'navigation'}
        className={'transition-all duration-300 bg-navy_mid relative z-[1100]'}
      >
        <div
          className={`transition-all duration-300 overflow-hidden truncate bg-navy_mid h-full text-white text-[14px] font-semibold flex flex-col relative w-full`}
        >
          <div
            className={
              'flex h-[52px] bg-navy_mid border-0 border-b border-solid border-navy_light sticky z-20 justify-start items-center top-0 gap-[82px] px-5'
            }
          >
            {navigationOpen ? (
              <>
                <Logo small={!navigationOpen} />
                <button
                  onClick={() => setNavigationOpen(!navigationOpen)}
                  className={
                    'transition bg-transparent opacity-80 hover:opacity-100 border-0 text-white flex items-center justify-center text-center p-1 rounded-md cursor-pointer size-9 rs-nav-button -right-3 relative'
                  }
                >
                  <LayoutLeft />
                </button>
              </>
            ) : (
              <button
                className={
                  'flex items-center justify-center mt-[2px] ml-[2px] bg-transparent border-0 text-grey500 text-center rounded-md cursor-pointer'
                }
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <Logo small={true} />
              </button>
            )}
          </div>

          <div
            id={'nav-items-container'}
            className={'h-lvh overflow-y-auto no-scrollbar relative'}
          >
            <div
              className={`${gradientStyle} from-navy_mid to-transparent top-0 bg-gradient-to-b -mb-5`}
            />

            <ul
              className={
                'flex flex-col items-start list-none py-4 px-0 m-0 mb-[100px]'
              }
            >
              <NavItems
                items={navItems}
                renderCount={renderCount}
                collapsed={!navigationOpen}
              />
            </ul>

            <div
              className={`${gradientStyle} from-navy_mid to-transparent  bottom-[53px] bg-gradient-to-t -mt-7`}
            />
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Navigation;
