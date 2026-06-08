import type { FC } from 'react';

import { NodeLabelFetcher } from '../../breadcrumbs/NodeLabelFetcher';
import type { GetBreadcrumbLabelByNodeType } from '../../breadcrumbs/types';
import { useBreadcrumbs } from '../../breadcrumbs/useBreadcrumbs';
import { useNodeLabels } from '../../breadcrumbs/useNodeLabels';
import { BreadcrumbDisplay } from './BreadcrumbDisplay';
import { CopyLinkButton } from './CopyLinkButton';

interface Props {
  getBreadcrumbLabelByNodeType?: GetBreadcrumbLabelByNodeType;
}

export const GlobalBreadcrumbs: FC<Props> = ({
  getBreadcrumbLabelByNodeType,
}) => {
  const { breadcrumbs, nodes } = useBreadcrumbs();
  const { allLoaded } = useNodeLabels(nodes);
  const loading = !allLoaded;

  return (
    <div
      data-testid={'global-breadcrumbs'}
      className={'flex w-full items-center gap-3 min-w-0'}
    >
      <NodeLabelFetcher
        nodes={nodes}
        getBreadcrumbLabelByNodeType={getBreadcrumbLabelByNodeType}
      />

      <>
        <div
          className={`transition-all duration-500 ${loading ? 'opacity-25' : 'opacity-100'}`}
        >
          <CopyLinkButton disabled={loading} />
        </div>
        <div
          className={`transition-all duration-500 w-full min-w-0 ${loading ? 'pointer-events-none opacity-25' : 'pointer-events-auto opacity-100'}`}
        >
          <BreadcrumbDisplay breadcrumbs={breadcrumbs} />
        </div>
      </>
    </div>
  );
};
