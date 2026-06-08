import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import type { FC } from 'react';

export const WidgetLoading: FC = () => {
  return (
    <div className={'flex h-full text-center flex-wrap content-center'}>
      <div className={'flex-auto'}>
        <Spinner size={'normal'} />
      </div>
    </div>
  );
};
