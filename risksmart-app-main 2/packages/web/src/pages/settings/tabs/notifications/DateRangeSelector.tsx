import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import Select from '@risk-smart/themed-cloudscape-components/select';
import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  DateRangePreset,
  DateRangeState,
} from '@/hooks/notifications/types';
import { computeDateRange } from '@/hooks/notifications/useNotificationHistory';

interface DateRangeSelectorProps {
  value: DateRangeState;
  onChange: (dateRange: DateRangeState) => void;
}

const DateRangeSelector: FC<DateRangeSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'notificationHistory.dateRange',
  });

  const presetOptions: SelectProps.Options = useMemo(
    () => [
      { value: 'last24h', label: t('last24h') },
      { value: 'last7', label: t('last7') },
      { value: 'last30', label: t('last30') },
      { value: 'last90', label: t('last90') },
    ],
    [t]
  );

  const selectedOption = useMemo(
    () => presetOptions.find((o) => o.value === value.preset) ?? null,
    [value.preset, presetOptions]
  );

  const handleChange = useCallback(
    ({ detail }: { detail: SelectProps.ChangeDetail }) => {
      const preset = detail.selectedOption.value as DateRangePreset;
      onChange(computeDateRange(preset));
    },
    [onChange]
  );

  return (
    <Select
      selectedOption={selectedOption}
      onChange={handleChange}
      options={presetOptions}
      data-testid={'date-range-preset'}
    />
  );
};

export default DateRangeSelector;
