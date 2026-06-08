import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import type {
  BaseConnectionData,
  GoogleWorkspaceConfigData,
} from './EnterpriseConnectionSchema';
import {
  ClientCredentialsFields,
  DomainField,
  LoginExperienceSection,
} from './SharedSsoFormFields';

interface Props {
  isDisabled?: boolean;
}

const GoogleWorkspaceConfigurationForm: FC<Props> = ({
  isDisabled = false,
}) => {
  const { control } = useFormContext<GoogleWorkspaceConfigData>();
  const baseControl = control as unknown as Control<BaseConnectionData>;

  return (
    <>
      <DomainField
        control={baseControl}
        isDisabled={isDisabled}
        label={'Google Workspace Domain'}
        description={
          'Your Google Workspace domain. Ensure that this does not include the https://www. prefix'
        }
        placeholder={'e.g., example.com'}
      />

      <ClientCredentialsFields
        control={baseControl}
        isDisabled={isDisabled}
        providerLabel={'Google Workspace'}
      />

      <LoginExperienceSection control={baseControl} isDisabled={isDisabled} />
    </>
  );
};

export default GoogleWorkspaceConfigurationForm;
