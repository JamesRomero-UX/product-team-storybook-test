import i18n from '@risksmart-app/i18n/src/i18n';
import { type FC } from 'react';

import ValueWidget from '../value-widget/ValueWidget';

type Props = {
  unit?: string;
  loading?: boolean;
  value?: number;
  onClick?: () => void;
  noClickthroughMessageContent?: string;
};

const NumberWidget: FC<Props> = ({ value, unit, ...rest }) => {
  return (
    <ValueWidget
      value={
        value !== undefined ? String(Math.round(value * 10) / 10) : undefined
      }
      unit={unit ?? i18n.t('dashboard.units.total')}
      {...rest}
    />
  );
};

export default NumberWidget;
