import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

import type { GetBreadcrumbLabelByNodeType } from '../breadcrumbs/types';
import { GlobalActions } from './global-actions/GlobalActions';
import { GlobalBreadcrumbs } from './global-breadcrumbs/GlobalBreadcrumbs';

interface Props {
  getBreadcrumbLabelByNodeType?: GetBreadcrumbLabelByNodeType;
  children?: ReactNode;
}

export const GlobalHeader: FC<Props> = ({
  getBreadcrumbLabelByNodeType,
  children,
}) => {
  return (
    <div
      data-testid={'global-header-container'}
      className={clsx(
        'w-full h-[52px] bg-navy_mid text-white',
        'flex flex-col justify-center items-center',
        'border-0 border-b border-solid border-navy_light'
      )}
    >
      <div className={'flex items-center flex-wrap mx-auto w-full'}>
        <div
          className={
            'flex items-center justify-between min-w-0 w-full h-full pl-7'
          }
        >
          {getBreadcrumbLabelByNodeType ? (
            <GlobalBreadcrumbs
              getBreadcrumbLabelByNodeType={getBreadcrumbLabelByNodeType}
            />
          ) : (
            <div className={'w-full'} />
          )}
          <GlobalActions>{children}</GlobalActions>
        </div>
      </div>
    </div>
  );
};
