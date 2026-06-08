import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { CustomDataSourceWidgetSettingsFormFields } from './CustomDataSourceWidgetSettingsFormFields';
import {
  type CustomDataSourceWidgetSettings,
  customDataSourceWidgetSettingsSchema,
  defaultValues,
} from './customDataSourceWidgetSettingsSchema';

export type Props = {
  values: CustomDataSourceWidgetSettings | undefined;
  onSave: (data: CustomDataSourceWidgetSettings) => Promise<void>;
  onDismiss: () => void;
};

export const CustomDataSourceWidgetSettingsForm: FC<Props> = ({
  values,
  onSave,
  onDismiss,
}) => {
  const { t } = useTranslation('common');

  return (
    <ModalForm
      testId={'customDataSourceWidgetSettings'}
      visible={true}
      onSave={onSave}
      defaultValues={defaultValues}
      formId={''}
      values={values}
      schema={customDataSourceWidgetSettingsSchema}
      i18n={t('widget')}
      onDismiss={onDismiss}
    >
      <CustomDataSourceWidgetSettingsFormFields />
    </ModalForm>
  );
};
