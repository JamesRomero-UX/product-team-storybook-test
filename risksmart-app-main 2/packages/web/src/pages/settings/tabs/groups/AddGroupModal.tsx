import { useMutation } from '@apollo/client';
import { InsertUserGroupDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { evictField } from '@/utils/graphqlUtils';

import UserGroupFormFields from './forms/UserGroupFormFields';
import type { UserGroupFormFieldsSchema } from './forms/userGroupSchema';
import { defaultValues, UserGroupSchema } from './forms/userGroupSchema';

type Props = {
  onDismiss: () => void;
};

const AddGroupModal: FC<Props> = ({ onDismiss }) => {
  const { t } = useTranslation('common');
  const [insert] = useMutation(InsertUserGroupDocument, {
    update: (cache) => {
      evictField(cache, 'user_group_user');
      evictField(cache, 'user_group');
      evictField(cache, 'user');
    },
  });

  const onSave = async (data: UserGroupFormFieldsSchema) => {
    const result = await insert({
      variables: data,
    });
    const userGroupId = result.data?.insert_user_group_one?.Id;
    if (!userGroupId) {
      throw new Error('Id not found');
    }
  };

  const formId = 'add-user-group-form';

  return (
    <ModalForm
      i18n={t('userGroups')}
      defaultValues={defaultValues}
      schema={UserGroupSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
    >
      <UserGroupFormFields />
    </ModalForm>
  );
};

export default AddGroupModal;
