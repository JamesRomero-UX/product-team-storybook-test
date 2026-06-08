import { useMutation } from '@apollo/client';
import { InsertUserGroupUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import UserGroupMemberFormFields from './forms/UserGroupMemberFormFields';
import type { UserGroupMemberFormFieldsSchema } from './forms/UserGroupMemberSchema';
import {
  defaultValues,
  UserGroupMemberSchema,
} from './forms/UserGroupMemberSchema';

type Props = {
  onDismiss: () => void;
  userGroupId: string;
  existingUserIds?: string[];
};

const AddMembersModal: FC<Props> = ({
  onDismiss,
  userGroupId,
  existingUserIds,
}) => {
  const [insert] = useMutation(InsertUserGroupUsersDocument);
  const { t } = useTranslation();
  const onSave = async (data: UserGroupMemberFormFieldsSchema) => {
    const result = await insert({
      variables: {
        objects: data.Users.map((user) => ({
          UserId: user.value,
          UserGroupId: userGroupId,
        })),
      },
    });
    if (result.data?.insert_user_group_user?.affected_rows === 0) {
      throw new Error('Records not inserted.');
    }
  };

  const formId = 'add-user-group-member-form';

  return (
    <ModalForm
      i18n={t('userGroupMembers')}
      defaultValues={defaultValues}
      schema={UserGroupMemberSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
    >
      <UserGroupMemberFormFields existingUserIds={existingUserIds} />
    </ModalForm>
  );
};

export default AddMembersModal;
