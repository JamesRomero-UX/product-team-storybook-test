import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledMultiselect } from 'src/components/form/controlled-multiselect/ControlledMultiselect';
import ControlledSelect from 'src/components/form/controlled-select';

import type {
  UserDetailsFormFields,
  UserDetailsFormFieldsMultiRole,
} from './UserDetailsSchema';

interface Props {
  roleOptions: {
    id: string;
    value: string;
    description?: string;
  }[];
  readOnly?: boolean;
  multiRoleMode?: boolean;
}

const UserDetailsForm: FC<Props> = ({
  roleOptions,
  readOnly,
  multiRoleMode,
}) => {
  const { control } = useFormContext<
    UserDetailsFormFields | UserDetailsFormFieldsMultiRole
  >();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'userSettings',
  });

  // Convert roleOptions to format expected by ControlledMultiselect
  const multiselectRoleOptions = roleOptions.map((role) => ({
    label: role.value,
    value: role.id,
    description: role.description,
  }));

  return (
    <>
      {multiRoleMode ? (
        <ControlledMultiselect
          forceRequired={true}
          label={t('fields.roles')}
          name={'Roles'}
          description={t('fields.roles_help')}
          control={control}
          options={multiselectRoleOptions}
          disabled={readOnly}
        />
      ) : (
        <ControlledSelect
          forceRequired={true}
          key={'type'}
          filteringType={'auto'}
          label={t('fields.role')}
          name={'Role'}
          description={t('fields.role_help')}
          placeholder={t('fields.role_placeholder')}
          control={control}
          testId={'role'}
          options={roleOptions}
          disabled={readOnly}
        />
      )}
    </>
  );
};

export default UserDetailsForm;
