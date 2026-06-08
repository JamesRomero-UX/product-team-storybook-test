import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC } from 'react';
import type { Control } from 'react-hook-form';

import { ControlledInput } from '@/components/form/controlled-input/ControlledInput';
import ControlledTextarea from '@/components/form/controlled-textarea';

import type { BaseConnectionData } from './EnterpriseConnectionSchema';

interface BaseProps {
  control: Control<BaseConnectionData>;
  isDisabled?: boolean;
}

export const DomainField: FC<
  BaseProps & { label: string; description: string; placeholder: string }
> = ({ control, isDisabled, label, description, placeholder }) => (
  <ControlledInput
    name={'Domain'}
    label={label}
    description={description}
    control={control}
    placeholder={placeholder}
    disabled={isDisabled}
    forceRequired
  />
);

export const ClientCredentialsFields: FC<
  BaseProps & { providerLabel?: string }
> = ({ control, isDisabled, providerLabel }) => {
  const source = providerLabel
    ? `your ${providerLabel} application`
    : 'your application';

  return (
    <>
      <ControlledInput
        name={'ClientId'}
        label={'Client ID'}
        description={`Client ID from ${source}`}
        placeholder={'e.g. 123456789'}
        control={control}
        disabled={isDisabled}
        forceRequired
      />
      <ControlledInput
        name={'ClientSecret'}
        label={'Client Secret'}
        description={`Client secret from ${source}`}
        control={control}
        type={'password'}
        disabled={isDisabled}
        forceRequired
      />
    </>
  );
};

export const LoginExperienceSection: FC<BaseProps> = ({
  control,
  isDisabled,
}) => (
  <div className={'border-t border-grey200 pt-4 mt-2'}>
    <p className={'text-sm font-medium text-grey600 mb-4'}>
      {'Login Experience Customization'}
    </p>
    <SpaceBetween direction={'vertical'} size={'l'}>
      <ControlledTextarea
        name={'IdentityProviderDomains'} /**/
        label={'Identity Provider Domains (Optional)'}
        description={
          'Comma-separated list of domains for Home Realm Discovery. Users with matching email domains will be redirected to this identity provider.'
        }
        control={control}
        placeholder={'e.g. my-organization.com, my-organization.co.uk'}
        disabled={isDisabled}
      />
    </SpaceBetween>
  </div>
);
