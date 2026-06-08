import { Eye } from '@untitled-ui/icons-react';
import { useTranslation } from 'react-i18next';

import Button from '../button';
import { useFormBuilderStore } from './store/useFormBuilderStore';

export const FormPreviewButton = () => {
  const { setIsPreviewingForm } = useFormBuilderStore();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions',
  });

  return (
    <Button onClick={() => setIsPreviewingForm(true)}>
      <div className={'flex gap-x-3 items-center'}>
        <Eye />
        {t('previewButtonLabel')}
      </div>
    </Button>
  );
};
