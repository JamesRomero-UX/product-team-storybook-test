import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { SaveSsoConfigInput } from '@risksmart-app/trpc/src/services/service.types';
import { ArrowRight, InfoCircle } from '@untitled-ui/icons-react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
import Link from 'src/components/link';
import { useGetSsoConfigurations } from 'src/hooks/queries/sso-configuration/useGetSsoConfigurations';
import { circleInfoSheetsUrl } from 'src/utils/urls';

import { CustomisableForm } from '@/components/form/form/CustomisableForm';
import TabHeader from '@/components/tab-header';
import { useSaveSsoConfiguration } from '@/hooks/mutations/sso-configuration/useSaveSsoConfiguration';

import {
  AdConfigurationForm,
  AzureAdConfigurationForm,
  GoogleWorkspaceConfigurationForm,
  OktaConfigurationForm,
} from './forms';
import {
  AdConfigSchema,
  adDefaultValues,
  type EnterpriseConnectionFormData,
  GoogleWorkspaceConfigSchema,
  googleWorkspaceDefaultValues,
  OktaConfigSchema,
  oktaDefaultValues,
  Strategy,
  WaadConfigSchema,
  waadDefaultValues,
} from './forms/EnterpriseConnectionSchema';

interface ProviderOption {
  id: Strategy;
  name: string;
  description: string;
}

const providerOptions: ProviderOption[] = [
  { id: Strategy.Azure, name: 'Azure AD', description: 'Microsoft Azure' },
  { id: Strategy.Okta, name: 'Okta', description: 'Okta Identity' },
  {
    id: Strategy.Google,
    name: 'Google Workspace',
    description: 'Google Workspace',
  },
  { id: Strategy.Ad, name: 'LDAP', description: 'Active Directory / LDAP' },
];
const getSchemaAndDefaults = (provider: Strategy) => {
  switch (provider) {
    case Strategy.Azure:
      return { schema: WaadConfigSchema, defaultValues: waadDefaultValues };
    case Strategy.Okta:
      return { schema: OktaConfigSchema, defaultValues: oktaDefaultValues };
    case Strategy.Google:
      return {
        schema: GoogleWorkspaceConfigSchema,
        defaultValues: googleWorkspaceDefaultValues,
      };
    case Strategy.Ad:
      return { schema: AdConfigSchema, defaultValues: adDefaultValues };
    default:
      return { schema: WaadConfigSchema, defaultValues: waadDefaultValues };
  }
};

const SsoToggle: FC<{
  checked: boolean;
  disabled: boolean;
  onToggle: (data: EnterpriseConnectionFormData, enabled: boolean) => void;
}> = ({ checked, disabled, onToggle }) => {
  const { getValues } = useFormContext<EnterpriseConnectionFormData>();

  return (
    <Toggle
      checked={checked}
      onChange={({ detail }) => {
        const data = getValues();
        onToggle(data, detail.checked);
      }}
      disabled={disabled}
      ariaLabel={'Enable SSO'}
    />
  );
};

const SsoTab: FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Strategy>(
    Strategy.Azure
  );
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [hasInitialised, setHasInitialised] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<EnterpriseConnectionFormData | null>(null);

  const {
    data: existingConfigsData,
    loading: configsLoading,
    refetch,
  } = useGetSsoConfigurations({ queryArgs: undefined });
  const existingConfigs = existingConfigsData?.sso_configuration;

  const { saveSsoConfiguration } = useSaveSsoConfiguration(async () => {
    await refetch();
  });

  const existingConfig = useMemo(
    () => existingConfigs?.find((c) => c.Strategy === selectedProvider),
    [existingConfigs, selectedProvider]
  );

  const isLoading = loading || configsLoading;

  // Effect 1: auto-select the saved provider on initial page load (runs once)
  useEffect(() => {
    if (hasInitialised || !existingConfigs?.length) {
      return;
    }
    const first = existingConfigs[0];
    const strategy = first.Strategy as Strategy;
    if (Object.values(Strategy).includes(strategy)) {
      setSelectedProvider(strategy);
      setHasInitialised(true);
    }
  }, [existingConfigs, hasInitialised]);

  // Effect 2: sync ssoEnabled with the provider-scoped existingConfig
  // When existingConfig becomes undefined (user switched to unsaved provider), resets to false
  useEffect(() => {
    setSsoEnabled(existingConfig?.IsOrganizationConnected ?? false);
  }, [existingConfig]);

  const { schema, defaultValues: emptyDefaults } =
    getSchemaAndDefaults(selectedProvider);

  const defaultValues = useMemo(() => {
    if (!existingConfig || existingConfig.Strategy !== selectedProvider) {
      return emptyDefaults;
    }

    const domainAliases = existingConfig.DomainAliases?.join(', ') ?? '';

    return {
      ...emptyDefaults,
      Domain: existingConfig.Domain ?? '',
      ClientId: existingConfig.ClientId,
      IdentityProviderDomains: domainAliases,
    };
  }, [existingConfig, selectedProvider, emptyDefaults]);

  const parseDomainAliases = (domains?: string): string[] => {
    if (!domains) {
      return [];
    }

    return domains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
  };

  const mapFormDataToInput = (
    data: EnterpriseConnectionFormData
  ): SaveSsoConfigInput => {
    const domainAliases = parseDomainAliases(data.IdentityProviderDomains);
    const baseInput = {
      strategy: data.Strategy,
      clientId: data.ClientId,
      clientSecret: data.ClientSecret,
      domainAliases: domainAliases.length > 0 ? domainAliases : undefined,
      connectionId: existingConfig?.ConnectionId,
    };

    return {
      ...baseInput,
      domain: data.Domain,
      addOrgConnection: ssoEnabled,
    };
  };

  const doSaveConfiguration = async (data: EnterpriseConnectionFormData) => {
    setLoading(true);
    try {
      const input = mapFormDataToInput(data);
      await saveSsoConfiguration(input);
    } catch (error) {
      addNotification({
        type: 'error',
        content: `Failed to save SSO configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async (
    data: EnterpriseConnectionFormData
  ) => {
    const hasConflict = !!existingConfigs?.length && !existingConfig;
    if (hasConflict) {
      setPendingFormData(data);

      return;
    }
    await doSaveConfiguration(data);
  };

  const handleConfirmOverwrite = async () => {
    if (pendingFormData) {
      await doSaveConfiguration(pendingFormData);
    }
    setPendingFormData(null);
  };

  const handleEnableSso = async (
    data: EnterpriseConnectionFormData,
    enabled: boolean
  ) => {
    if (!existingConfig) {
      return;
    }

    if (!data.ClientSecret?.trim()) {
      addNotification({
        type: 'error',
        content: `Please input the client secret to ${enabled ? 'enable ' : 'disable '} SSO.`,
      });

      return;
    }

    setSsoEnabled(enabled);
    setLoading(true);

    try {
      await saveSsoConfiguration({
        strategy: existingConfig.Strategy as Strategy,
        clientId: existingConfig.ClientId,
        clientSecret: data.ClientSecret,
        domain: existingConfig.Domain ?? '',
        connectionId: existingConfig.ConnectionId,
        addOrgConnection: enabled,
      });
    } catch (error) {
      setSsoEnabled(!enabled);
      addNotification({
        type: 'error',
        content: `Failed to ${enabled ? 'enable' : 'disable'} SSO: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormDescription = () => {
    switch (selectedProvider) {
      case Strategy.Azure:
        return 'Enter your Microsoft Azure AD configuration details';
      case Strategy.Okta:
        return 'Enter your Okta configuration details';
      case Strategy.Google:
        return 'Enter your Google Workspace configuration details';
      case Strategy.Ad:
        return 'Enter your Active Directory/ LDAP configuration details';
      default:
        return 'Enter your SAML identity provider configuration details';
    }
  };

  const renderFormFields = () => {
    switch (selectedProvider) {
      case Strategy.Azure:
        return <AzureAdConfigurationForm isDisabled={loading} />;
      case Strategy.Okta:
        return <OktaConfigurationForm disabled={loading} />;
      case Strategy.Google:
        return <GoogleWorkspaceConfigurationForm isDisabled={loading} />;
      case Strategy.Ad:
        return <AdConfigurationForm isDisabled={loading} />;
      default:
        return null;
    }
  };

  return (
    <div className={'flex flex-col gap-6'}>
      <TabHeader>{'SSO Configuration'}</TabHeader>
      <Alert
        type={'warning'}
        header={
          <div className={'flex items-center gap-2'}>
            <span className={'font-semibold'}>
              {'Important: Test before enabling'}
            </span>
          </div>
        }
      >
        {
          'Always test your SSO configuration before enabling it. Incorrect settings may prevent users from logging in. Keep your current admin credentials accessible as a backup.'
        }
      </Alert>

      <div className={'flex gap-6 items-start'}>
        <div className={'flex-1 min-w-0 flex flex-col gap-6'}>
          <div className={'[&>div]:shadow-none'}>
            <Container
              header={
                <Header description={'Select your identity provider'}>
                  {'Identity Provider'}
                </Header>
              }
            >
              <div className={'grid grid-cols-2 gap-4 min-w-[400px]'}>
                {providerOptions.map((provider) => {
                  const isSelected = selectedProvider === provider.id;

                  return (
                    <button
                      key={provider.id}
                      type={'button'}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`
                        flex items-start gap-3 p-4 rounded-lg border text-left cursor-pointer
                        transition-all duration-200 shadow-none
                        ${
                          isSelected
                            ? 'border-teal bg-light_blue'
                            : 'border-grey200 bg-white hover:border-grey300'
                        }
                      `}
                    >
                      <div
                        className={`
                          w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                          ${isSelected ? 'border-teal' : 'border-grey300'}
                        `}
                      >
                        {isSelected && (
                          <div
                            className={'w-[10px] h-[10px] rounded-full bg-teal'}
                          />
                        )}
                      </div>
                      <div>
                        <div className={'font-medium text-grey800'}>
                          {provider.name}
                        </div>
                        <div className={'text-sm text-grey500'}>
                          {provider.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Container>
          </div>

          <CustomisableForm<EnterpriseConnectionFormData>
            key={`${selectedProvider}-${existingConfig?.Id ?? 'new'}-${existingConfig?.ModifiedAtTimestamp ?? ''}`}
            schema={schema}
            defaultValues={defaultValues}
            onSave={handleSaveConfiguration}
            onDismiss={() => {
              /* empty */
            }}
            formId={`sso-${selectedProvider}-form`}
            i18n={{ entity_name: 'SSO Configuration' }}
            submitActions={[
              {
                label: 'Save',
                action: handleSaveConfiguration,
                disableNotification: true,
                loading,
                disabled: loading,
              },
            ]}
            renderTemplate={({ actions }) => (
              <>
                <div className={'[&>div]:shadow-none'}>
                  <Container
                    header={
                      <Header description={getFormDescription()}>
                        {'Configuration'}
                      </Header>
                    }
                  >
                    {renderFormFields()}
                  </Container>
                </div>

                <div
                  className={
                    'flex items-center justify-between border-0 border-grey200 border-solid border-t pt-6 mt-6'
                  }
                >
                  <div className={'flex items-center gap-3'}>{actions}</div>
                  <div className={'flex items-center gap-3'}>
                    <span className={'text-grey600'}>{'Enable SSO'}</span>
                    <SsoToggle
                      checked={ssoEnabled}
                      disabled={isLoading || !existingConfig}
                      onToggle={handleEnableSso}
                    />
                  </div>
                </div>
              </>
            )}
          >
            {null}
          </CustomisableForm>
        </div>

        <div className={'w-[320px] flex-shrink-0 hidden lg:block'}>
          <div className={'bg-light_blue rounded-lg p-5 sticky top-4'}>
            <div className={'flex items-center gap-2 mb-4'}>
              <InfoCircle className={'w-5 h-5 text-teal3'} />
              <span className={'font-semibold text-grey800'}>
                {'Setup Guides'}
              </span>
            </div>
            <div className={'flex flex-col gap-4'}>
              <Link
                key={circleInfoSheetsUrl('single-sign-on-sso')}
                href={circleInfoSheetsUrl('single-sign-on-sso')}
              >
                <div className={'flex items-center gap-2 text-grey600'}>
                  <ArrowRight className={'w-4 h-4'} />
                  <span>{'SSO setup guide'}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isVisible={!!pendingFormData}
        onConfirm={handleConfirmOverwrite}
        onDismiss={() => setPendingFormData(null)}
        header={'Replace existing SSO configuration?'}
      >
        {
          'You already have an SSO configuration set up with a different provider. Saving will replace it. Do you want to continue?'
        }
      </ConfirmModal>
    </div>
  );
};

export default SsoTab;
