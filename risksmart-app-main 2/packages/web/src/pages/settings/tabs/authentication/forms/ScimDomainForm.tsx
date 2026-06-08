import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';

import type { ScimDomainFormFields } from './ScimDomainFormSchema';

const ScimDomainForm: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimDomains',
  });
  const { control } = useFormContext<ScimDomainFormFields>();

  return (
    <ControlledInput
      key={'domain'}
      name={'domain'}
      forceRequired={true}
      label={t('fields.domain')}
      placeholder={t('placeholders.domain')}
      control={control}
    />
  );
};

export default ScimDomainForm;
