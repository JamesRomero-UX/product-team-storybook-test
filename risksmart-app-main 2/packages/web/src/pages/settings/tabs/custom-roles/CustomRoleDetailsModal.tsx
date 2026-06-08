import { useMutation } from '@apollo/client';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertCustomRoleDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import CustomRoleFormFields from './forms/CustomRoleFormFields';
import type { CustomRoleFormFields as CustomRoleFormFieldsType } from './forms/customRoleSchema';
import { CustomRoleSchema } from './forms/customRoleSchema';
import { defaultValues } from './forms/customRoleSchema';

type Props = {
  onDismiss: (saved: boolean) => void;
  availableRoles: {
    roleKey: string;
    name: string;
    groupKey: Parent_Type_Enum;
    category: 'Manager' | 'Viewer';
  }[];
};

const CustomRoleModal: FC<Props> = ({ onDismiss, availableRoles }) => {
  const { t } = useTranslation();
  const [insert] = useMutation(InsertCustomRoleDocument);

  const onSave = async (data: CustomRoleFormFieldsType) => {
    const result = await insert({
      variables: {
        input: {
          ...data,
          UserIds: data.UserIds.map((c) => c.value),
        },
      },
    });
    const customRoleId = result.data?.customRoleInsert?.Id;
    if (!customRoleId) {
      throw new Error('Error creating custom role');
    }
  };

  const formId = 'custom-role-form';

  return (
    <ModalForm
      defaultValues={defaultValues}
      schema={CustomRoleSchema}
      i18n={t('customRoles')}
      onDismiss={onDismiss}
      onSave={onSave}
      formId={formId}
      visible={true}
    >
      <CustomRoleFormFields availableRoles={availableRoles} />
    </ModalForm>
  );
};

export default CustomRoleModal;
