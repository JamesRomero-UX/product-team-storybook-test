import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';
import { ControlledBooleanRadioGroup } from 'src/components/form/controlled-radio-group/ControlledBooleanRadioGroup';
import { yesNoOptions } from 'src/components/form/controlled-radio-group/radioGroupUtils';

import type { UserGroupFormFieldsSchema } from './userGroupSchema';

interface Props {
  readOnly?: boolean;
}

const UserGroupFormFields: FC<Props> = ({ readOnly }) => {
  const { control } = useFormContext<UserGroupFormFieldsSchema>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'userGroups',
  });

  return (
    <>
      <ControlledInput
        key={'name'}
        testId={'name'}
        forceRequired={true}
        name={'Name'}
        label={t('fields.nameField')}
        placeholder={t('fields.placeholders.name')}
        control={control}
        disabled={readOnly}
      />
      <ControlledInput
        testId={'description'}
        key={'description'}
        name={'Description'}
        label={t('fields.descriptionField')}
        placeholder={t('fields.placeholders.description')}
        control={control}
        disabled={readOnly}
      />
      <ControlledInput
        testId={'email'}
        key={'email'}
        name={'Email'}
        label={t('fields.emailField')}
        placeholder={t('fields.placeholders.email')}
        control={control}
        disabled={readOnly}
      />
      <ControlledBooleanRadioGroup
        testId={'ownerContributor'}
        label={t('fields.OwnerContributorField')}
        name={'OwnerContributor'}
        control={control}
        items={yesNoOptions}
        disabled={readOnly}
      />
    </>
  );
};

export default UserGroupFormFields;
