import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import type {
  BaseConnectionData,
  WaadConfigData,
} from './EnterpriseConnectionSchema';
import {
  ClientCredentialsFields,
  DomainField,
  LoginExperienceSection,
} from './SharedSsoFormFields';

interface Props {
  isDisabled?: boolean;
}

const AzureAdConfigurationForm: FC<Props> = ({ isDisabled = false }) => {
  const { control } = useFormContext<WaadConfigData>();
  const baseControl = control as unknown as Control<BaseConnectionData>;

  return (
    <>
      <DomainField
        control={baseControl}
        isDisabled={isDisabled}
        label={'Microsoft Azure AD Domain'}
        description={
          'Your Azure AD tenant domain. Ensure that this does not include the https://www. prefix'
        }
        placeholder={'e.g. example.onmicrosoft.com'}
      />

      <ClientCredentialsFields
        control={baseControl}
        isDisabled={isDisabled}
        providerLabel={'Azure AD'}
      />

      <LoginExperienceSection control={baseControl} isDisabled={isDisabled} />
    </>
  );
};

export default AzureAdConfigurationForm;
