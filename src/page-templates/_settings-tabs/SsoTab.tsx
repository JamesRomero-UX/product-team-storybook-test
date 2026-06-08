// Settings → SSO tab
//
// Mirrors pages/settings/tabs/sso/Tab.tsx.
//
// Production layout:
//   <div className='flex flex-col gap-6'>
//     <TabHeader>SSO Configuration</TabHeader>
//     <Alert type='warning'>Test before enabling</Alert>
//     <div className='flex gap-6 items-start'>
//       <div className='flex-1 ...'>
//         <Container header='Identity Provider'>
//           <grid 2-col> [provider buttons]
//         </Container>
//         <CustomisableForm>
//           <Container header='Configuration'>{providerFields}</Container>
//           <action bar with Save + Enable SSO toggle>
//         </CustomisableForm>
//       </div>
//       <div className='w-[320px] ...'>
//         Sticky sidebar with Setup Guides + SSO setup guide link
//       </div>
//     </div>
//
// We render the provider selection grid + a representative Azure
// config form (Domain / Client ID / Client secret / Domain aliases),
// the action bar, and the sidebar.

import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Container from '@risk-smart/themed-cloudscape-components/container';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { ArrowRight, InfoCircle } from '@untitled-ui/icons-react';
import { useState } from 'react';

type ProviderId = 'azure' | 'okta' | 'google' | 'ad';

const PROVIDERS: Array<{
  id: ProviderId;
  name: string;
  description: string;
}> = [
  { id: 'azure',  name: 'Azure AD',         description: 'Microsoft Azure' },
  { id: 'okta',   name: 'Okta',             description: 'Okta Identity' },
  { id: 'google', name: 'Google Workspace', description: 'Google Workspace' },
  { id: 'ad',     name: 'LDAP',             description: 'Active Directory / LDAP' },
];

const PROVIDER_DESCRIPTIONS: Record<ProviderId, string> = {
  azure:  'Enter your Microsoft Azure AD configuration details',
  okta:   'Enter your Okta configuration details',
  google: 'Enter your Google Workspace configuration details',
  ad:     'Enter your Active Directory / LDAP configuration details',
};

const SsoTab = () => {
  const [provider, setProvider] = useState<ProviderId>('azure');
  const [ssoEnabled, setSsoEnabled] = useState(false);

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
                {PROVIDERS.map((p) => {
                  const isSelected = provider === p.id;

                  return (
                    <button
                      key={p.id}
                      type={'button'}
                      onClick={() => setProvider(p.id)}
                      className={
                        'flex items-start gap-3 p-4 rounded-lg border text-left cursor-pointer transition-all duration-200 shadow-none ' +
                        (isSelected
                          ? 'border-teal bg-light_blue'
                          : 'border-grey200 bg-white hover:border-grey300')
                      }
                    >
                      <div
                        className={
                          'w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ' +
                          (isSelected ? 'border-teal' : 'border-grey300')
                        }
                      >
                        {isSelected && (
                          <div
                            className={'w-[10px] h-[10px] rounded-full bg-teal'}
                          />
                        )}
                      </div>
                      <div>
                        <div className={'font-medium text-grey800'}>{p.name}</div>
                        <div className={'text-sm text-grey500'}>
                          {p.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Container>
          </div>

          <div className={'[&>div]:shadow-none'}>
            <Container
              header={
                <Header description={PROVIDER_DESCRIPTIONS[provider]}>
                  {'Configuration'}
                </Header>
              }
            >
              <SpaceBetween size={'m'}>
                <FormField label={'Domain'}>
                  <Input value={'acme.onmicrosoft.com'} onChange={() => undefined} />
                </FormField>
                <FormField label={'Client ID'}>
                  <Input
                    value={'4f8a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c'}
                    onChange={() => undefined}
                  />
                </FormField>
                <FormField label={'Client secret'}>
                  <Input
                    value={'•••••••••••••••••••••••'}
                    type={'password'}
                    onChange={() => undefined}
                  />
                </FormField>
                <FormField label={'Identity provider domains (comma-separated)'}>
                  <Input value={'acme.com, acme.co.uk'} onChange={() => undefined} />
                </FormField>
              </SpaceBetween>
            </Container>
          </div>

          <div
            className={
              'flex items-center justify-between border-0 border-grey200 border-solid border-t pt-6 mt-6'
            }
          >
            <div className={'flex items-center gap-3'}>
              <Button variant={'primary'}>{'Save'}</Button>
              <Button>{'Cancel'}</Button>
            </div>
            <div className={'flex items-center gap-3'}>
              <span className={'text-grey600'}>{'Enable SSO'}</span>
              <Toggle
                checked={ssoEnabled}
                onChange={({ detail }) => setSsoEnabled(detail.checked)}
                ariaLabel={'Enable SSO'}
              />
            </div>
          </div>
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
              <a
                href={'#'}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <div className={'flex items-center gap-2 text-grey600'}>
                  <ArrowRight className={'w-4 h-4'} />
                  <span>{'SSO setup guide'}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SsoTab;
