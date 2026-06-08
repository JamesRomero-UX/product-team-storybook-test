import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import type { ControlFormFieldData } from 'src/pages/controls/update/forms/controlSchema';
import {
  ControlFormSchema,
  defaultValues,
} from 'src/pages/controls/update/forms/controlSchema';

import ControlFormFields from '../update/forms/ControlFormFields';

type Props = {
  onDismiss: () => void;
  onSave: (control: ControlFormFieldData) => Promise<void>;
};

const ControlCreateModal: FC<Props> = ({ onDismiss, onSave }) => {
  const { t } = useTranslation();

  return (
    <ModalForm
      testId={'controlForm'}
      i18n={t('controls')}
      onSave={onSave}
      schema={ControlFormSchema}
      defaultValues={{ ...defaultValues }}
      onDismiss={onDismiss}
      formId={'control-form'}
      visible={true}
      parentType={Parent_Type_Enum.Control}
    >
      <ControlFormFields latestTestDate={null} />
    </ModalForm>
  );
};

export default ControlCreateModal;
