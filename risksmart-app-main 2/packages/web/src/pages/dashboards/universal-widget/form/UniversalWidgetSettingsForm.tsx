import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormTemplateProps } from 'src/components/form/form/types';

import { emptyFilterQuery } from '@/utils/collectionUtils';

import type { SettingsSchema } from '../settingsSchema';
import { settingsSchema } from '../settingsSchema';
import type { GigawidgetSettings } from '../util';
import { UniversalWidgetSettingsFormFields } from './UniversalWidgetSettingsFormFields';

export type Props = {
  renderTemplate: (props: FormTemplateProps<SettingsSchema>) => ReactNode;
  settings: GigawidgetSettings | null;
  onSave: (data: SettingsSchema) => Promise<void>;
  onDismiss: () => void;
};

export const UniversalWidgetSettingsForm: FC<Props> = ({
  settings,
  onSave,
  renderTemplate,
  onDismiss,
}) => {
  const { t } = useTranslation('common');
  const values: SettingsSchema = {
    filtering: emptyFilterQuery,
    aggregationType: 'count',
    showFilters: true,
    ignoreDashboardDateFilter: false,
    unit: 'Total',
    customTitle: false,
    ...(settings ?? {}),
  } as SettingsSchema;

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
      <UniversalWidgetSettingsFormFields />
    </CustomisableForm>
  );
};
