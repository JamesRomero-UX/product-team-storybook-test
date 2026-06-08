import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';
import { ControlledSwitch } from 'src/components/form/controlled-switch/ControlledSwitch';
import { FormField } from 'src/components/form/form/FormField';

import type { WidgetDataSource } from '../../gigawidget/types';
import { WidgetPropertyFilter } from '../../universal-widget/form/WidgetPropertyFilter';
import type { SettingsSchema } from '../../universal-widget/settingsSchema';
import { TestIds } from './WidgetSettingsFormFieldsTestIds';

type Props<TDataSource extends WidgetDataSource> = {
  dataSource: TDataSource;
};

export const WidgetSettingsFormFields = <TDataSource extends WidgetDataSource>({
  dataSource,
}: Props<TDataSource>) => {
  const { control, watch } = useFormContext<SettingsSchema>();
  const { t } = useTranslation('common', {
    keyPrefix: 'dashboard.widgetSettings.fields',
  });

  const customTitle = watch('customTitle');

  return (
    <div>
      <Controller
        control={control}
        render={({ field: { value, onChange } }) => (
          <>
            <FormField
              testId={TestIds.Filtering}
              label={'Filtering (optional)'}
            >
              <WidgetPropertyFilter
                value={value}
                onChange={onChange}
                dataSource={dataSource}
              />
            </FormField>
            <div className={'mb-4'}>
              <ControlledSwitch
                name={'customTitle'}
                label={t('customTitle')}
                control={control}
              />
            </div>
            {customTitle && (
              <ControlledInput
                control={control}
                name={'title'}
                label={t('customTitle')}
              />
            )}
          </>
        )}
        name={'filtering'}
      />
    </div>
  );
};
