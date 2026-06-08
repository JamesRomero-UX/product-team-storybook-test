import { useMutation } from '@apollo/client';
import type { GetUserGroupByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateUserGroupDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

import { settingsGroupsUrl } from '@/utils/urls';

import UserGroupForm from '../../../forms/UserGroupForm';
import type { UserGroupFormFieldsSchema } from '../../../forms/userGroupSchema';

type Props = {
  userGroup: GetUserGroupByIdQuery['user_group'][number];
};

const Tab: FC<Props> = ({ userGroup }) => {
  const navigate = useNavigate();
  const [update] = useMutation(UpdateUserGroupDocument);

  const values = {
    Name: userGroup?.Name ?? '',
    Description: userGroup?.Description ?? '',
    Email: userGroup?.Email ?? '',
    OwnerContributor: userGroup?.OwnerContributor ?? undefined,
  };

  const onSave = async (data: UserGroupFormFieldsSchema) => {
    const result = await update({
      variables: {
        ...data,
        Id: userGroup.Id,
        OriginalTimestamp: userGroup?.ModifiedAtTimestamp ?? '',
      },
    });
    if (result.data?.update_user_group?.affected_rows !== 1) {
      throw new Error(
        'Records not updated. Record may have been updated by another user'
      );
    }
    navigate(settingsGroupsUrl());
  };

  const onDismiss = () => navigate(settingsGroupsUrl());

  return (
    <UserGroupForm onSave={onSave} onDismiss={onDismiss} values={values} />
  );
};

export default Tab;
