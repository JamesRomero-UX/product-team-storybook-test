import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledSelect from 'src/components/form/controlled-select';

import type { ScimTokenFormFields } from './ScimTokenFormSchema';

const ScimDomainForm: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimTokens',
  });
  const { control } = useFormContext<ScimTokenFormFields>();

  return (
    <ControlledSelect
      testId={'expireInMonths'}
      placeholder={t('placeholders.expireInMonths')}
      name={'expireInMonths'}
      label={t('fields.expireInMonths')}
      options={[
        { value: '6', label: '6 months' },
        { value: '12', label: '12 months' },
        { value: '24', label: '24 months' },
      ]}
      control={control}
    />
  );
};

export default ScimDomainForm;
