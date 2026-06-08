import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';

import type { AddContactSchemaFields } from './schema';

export const AddContactForm: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts.fields',
  });
  const { control } = useFormContext<AddContactSchemaFields>();

  return (
    <>
      <ControlledInput
        name={'Email'}
        label={t('email')}
        control={control}
        forceRequired
      />
      <ControlledInput name={'Name'} label={t('name')} control={control} />
      <ControlledInput
        name={'JobTitle'}
        label={t('jobTitle')}
        control={control}
      />
    </>
  );
};
