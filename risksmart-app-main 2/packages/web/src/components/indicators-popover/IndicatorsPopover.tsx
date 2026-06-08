import Popover from '@risk-smart/themed-cloudscape-components/popover';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Activity } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import IndicatorPopoverContent from './IndicatorPopoverContent';

interface Props {
  id: string;
  count: number;
}

const IndicatorsPopover: FC<Props> = ({ id, count }) => {
  const { t } = useTranslation('taxonomy');

  return (
    <Popover
      dismissButton={true}
      position={'left'}
      size={'small'}
      header={i18n.format(t('indicator_other'), 'capitalize')}
      content={<IndicatorPopoverContent parentId={id} />}
    >
      <div>
        {count}&nbsp;
        <Activity
          viewBox={'0 0 24 24'}
          height={16}
          width={16}
          className={'align-bottom'}
          color={'#A2A2B3'}
        />
      </div>
    </Popover>
  );
};

export default IndicatorsPopover;
