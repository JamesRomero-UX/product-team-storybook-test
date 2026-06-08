import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { emptyFilterQuery } from '@/utils/collectionUtils';

import { useDashboardWidgetSettings } from '../../../../context/useDashboardWidgetSettings';
import { RichTextForm } from './RichTextForm';
import type { WidgetSettings } from './widgetSettingsSchema';
import { widgetSettingsSchema } from './widgetSettingsSchema';

type Props = {
  onDismiss: () => void;
  onSave: (data: WidgetSettings) => Promise<void>;
};

export const EditorModal = ({ onDismiss, onSave }: Props) => {
  const [settings] = useDashboardWidgetSettings<WidgetSettings>();

  const values = {
    filtering: emptyFilterQuery,
    ...(settings ?? {}),
  };
  const { t } = useTranslation();

  return (
    <ModalForm
      formId={'richtext-modal-form'}
      defaultValues={{ content: '', ...values }}
      i18n={t('widget')}
      onSave={onSave}
      schema={widgetSettingsSchema}
      visible={true}
      onDismiss={onDismiss}
    >
      <RichTextForm />
    </ModalForm>
  );
};
