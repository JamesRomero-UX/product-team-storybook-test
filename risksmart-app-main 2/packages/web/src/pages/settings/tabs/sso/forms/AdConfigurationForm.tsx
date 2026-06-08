import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import type {
  AdConfigData,
  BaseConnectionData,
} from './EnterpriseConnectionSchema';
import {
  ClientCredentialsFields,
  DomainField,
  LoginExperienceSection,
} from './SharedSsoFormFields';

interface Props {
  isDisabled?: boolean;
}

const AdConfigurationForm: FC<Props> = ({ isDisabled = false }) => {
  const { control } = useFormContext<AdConfigData>();
  const baseControl = control as unknown as Control<BaseConnectionData>;

  return (
    <>
      <DomainField
        control={baseControl}
        isDisabled={isDisabled}
        label={'LDAP Domain'}
        description={
          'Your LDAP domain. Ensure that this does not include the https://www. prefix'
        }
        placeholder={'e.g. example.com'}
      />

      <ClientCredentialsFields
        control={baseControl}
        isDisabled={isDisabled}
        providerLabel={'LDAP'}
      />

      <LoginExperienceSection control={baseControl} isDisabled={isDisabled} />
    </>
  );
};

export default AdConfigurationForm;
