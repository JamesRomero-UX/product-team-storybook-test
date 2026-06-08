import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import type {
  BaseConnectionData,
  OktaConfigData,
} from './EnterpriseConnectionSchema';
import {
  ClientCredentialsFields,
  DomainField,
  LoginExperienceSection,
} from './SharedSsoFormFields';

interface Props {
  disabled?: boolean;
}

const OktaConfigurationForm: FC<Props> = ({ disabled = false }) => {
  const { control } = useFormContext<OktaConfigData>();
  const baseControl = control as unknown as Control<BaseConnectionData>;

  return (
    <>
      <DomainField
        control={baseControl}
        isDisabled={disabled}
        label={'Okta Domain'}
        description={
          'Your Okta organization domain. Ensure that this does not include the https://www. prefix'
        }
        placeholder={'e.g. example.okta.com'}
      />

      <ClientCredentialsFields
        control={baseControl}
        isDisabled={disabled}
        providerLabel={'Okta'}
      />

      <LoginExperienceSection control={baseControl} isDisabled={disabled} />
    </>
  );
};

export default OktaConfigurationForm;
