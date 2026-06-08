import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserMultiSelect from 'src/components/form/controlled-group-and-user-multi-select';

import type { UserGroupMemberFormFieldsSchema } from './UserGroupMemberSchema';

type Props = {
  existingUserIds?: string[];
};

const UserGroupMemberFormFields: FC<Props> = ({ existingUserIds }) => {
  const { control } = useFormContext<UserGroupMemberFormFieldsSchema>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'userGroupMembers',
  });

  return (
    <>
      <ControlledGroupAndUserMultiSelect
        key={'users'}
        control={control}
        label={t('fields.users')}
        testId={'users'}
        name={'Users'}
        placeholder={t('fields.placeholders.users')}
        includeGroups={false}
        disabled={false}
        userFilter={(u) => !existingUserIds?.includes(u.Id!)}
      />
    </>
  );
};

export default UserGroupMemberFormFields;
