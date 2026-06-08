import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormTemplateProps } from 'src/components/form/form/types';

import { emptyFilterQuery } from '@/utils/collectionUtils';

import type { WidgetDataSource } from '../../gigawidget/types';
import { WidgetSettingsFormFields } from './WidgetSettingsFormFields';
import type { SettingsSchema } from './widgetSettingsSchema';
import { settingsSchema } from './widgetSettingsSchema';

export type Props<TDataSource extends WidgetDataSource> = {
  renderTemplate: (props: FormTemplateProps<SettingsSchema>) => ReactNode;
  settings: null | SettingsSchema;
  onSave: (data: SettingsSchema) => Promise<void>;
  onDismiss: () => void;
  dataSource: TDataSource;
};

export const WidgetSettingsForm: FC<Props<WidgetDataSource>> = ({
  settings,
  onSave,
  renderTemplate,
  onDismiss,
  dataSource,
}) => {
  const { t } = useTranslation('common');
  const values: SettingsSchema = {
    filtering: emptyFilterQuery,
    customTitle: false,
    ...(settings ?? {}),
  };

  return (
    <CustomisableForm
      onSave={onSave}
      defaultValues={values}
      formId={'gigawidget-form'}
      schema={settingsSchema}
      i18n={t('widget')}
      renderTemplate={renderTemplate}
      onDismiss={onDismiss}
    >
      <WidgetSettingsFormFields dataSource={dataSource} />
    </CustomisableForm>
  );
};
