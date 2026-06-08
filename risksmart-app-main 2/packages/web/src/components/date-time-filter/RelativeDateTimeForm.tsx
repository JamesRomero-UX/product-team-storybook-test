import type { PropertyFilterOperatorForm } from '@cloudscape-design/collection-hooks';
import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import { useTranslation } from 'react-i18next';
import { DateRangePickerInput } from 'src/components/form/controlled-date-range-picker/ControlledDateRangePicker';

import { defaultRelativeOptions } from '../form/controlled-date-range-picker/defaultRelativeOptions';

export const RelativeDateTimeForm: PropertyFilterOperatorForm<
  null | string
> = ({ value, onChange }) => {
  const { t } = useTranslation('common');

  // Cloudscape docs: Treat it as an unknown and assert for the type to prevent runtime errors.
  // This is filthy, thanks Cloudscape.
  // https://cloudscape.design/components/property-filter?tabId=api
  const tValue = (value as unknown as DateRangePickerProps.Value) || null;
  const tOnChange = onChange as unknown as (
    e: DateRangePickerProps.Value | null
  ) => void;

  return (
    <div className={'date-time-form'} data-testid={'relative-date-time-form'}>
      <DateRangePickerInput
        value={tValue}
        onChange={(e) => {
          tOnChange?.(e);
        }}
        placeholder={t('dashboard.filter_by_date')}
        relativeOptions={defaultRelativeOptions}
        isExpandable={true}
      />
    </div>
  );
};
