import Button from '@risksmart-app/components/src/button';
import type { FC } from 'react';

export type Props = {
  loading: boolean;
  currentPageIndex: number;
  pageSize: number;
  onPageChangeClick: (e: { requestedPageIndex: number }) => void;
  currentPageSize: number;
};

const Pager: FC<Props> = ({
  loading,
  onPageChangeClick,
  currentPageIndex,
  pageSize,
  currentPageSize,
}) => (
  <div className={'flex h-full items-center'}>
    <Button
      variant={'inline-icon'}
      iconName={'angle-left'}
      data-testid={'previous-page'}
      disabled={loading || currentPageIndex === 0}
      onClick={() =>
        onPageChangeClick({ requestedPageIndex: --currentPageIndex })
      }
    />
    <div className={'px-4'}>{currentPageIndex + 1}</div>
    <Button
      disabled={loading || currentPageSize < pageSize}
      variant={'inline-icon'}
      iconName={'angle-right'}
      data-testid={'next-page'}
      ariaLabel={'Next'}
      onClick={() =>
        onPageChangeClick({ requestedPageIndex: ++currentPageIndex })
      }
    />
  </div>
);

export default Pager;
