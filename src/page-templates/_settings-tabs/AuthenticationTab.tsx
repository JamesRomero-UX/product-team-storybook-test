// Settings → Authentication tab
//
// Mirrors pages/settings/tabs/authentication/Tab.tsx.
//
// Production layout (verbatim):
//   <div className='flex flex-col gap-5'>
//     <TabHeader actions={Enable | Disable}>{header}</TabHeader>
//     {scimEnabled && <ScimConfig />}
//     <ConfirmModal ... />
//   </div>
//
// We start in the disabled state by default (Enable button visible).
// Clicking Enable toggles to enabled and shows a minimal ScimConfig
// stub (domains + token rows) — the production component pulls
// domains and tokens from GraphQL.

import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

const ScimConfigStub = () => (
  <SpaceBetween size={'m'}>
    <Container
      header={
        <Header
          variant={'h3'}
          description={'Authorised IdP domains.'}
        >
          {'Domains'}
        </Header>
      }
    >
      <Box variant={'p'} color={'text-status-inactive'}>
        {'No domains added yet.'}
      </Box>
      <div className={'mt-3'}>
        <Button>{'Add domain'}</Button>
      </div>
    </Container>

    <Container
      header={
        <Header
          variant={'h3'}
          description={'SCIM tokens for provisioning.'}
        >
          {'Tokens'}
        </Header>
      }
    >
      <div className={'flex items-center justify-between py-2'}>
        <div>
          <div className={'font-medium text-grey800'}>{'Default token'}</div>
          <div className={'text-sm text-grey500 font-mono'}>
            {'••••••••••••••••••••••••••••'}
          </div>
        </div>
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button>{'Copy'}</Button>
          <Button>{'Regenerate'}</Button>
        </SpaceBetween>
      </div>
    </Container>

    <Alert type={'info'}>
      {
        'Provide your identity provider with the SCIM base URL and the token above to enable automated user provisioning.'
      }
    </Alert>
  </SpaceBetween>
);

const AuthenticationTab = () => {
  const [scimEnabled, setScimEnabled] = useState(false);

  return (
    <div className={'flex flex-col gap-5'}>
      <TabHeader
        actions={
          scimEnabled ? (
            <Button onClick={() => setScimEnabled(false)}>{'Disable'}</Button>
          ) : (
            <Button variant={'primary'} onClick={() => setScimEnabled(true)}>
              {'Enable'}
            </Button>
          )
        }
      >
        {'SCIM provisioning'}
      </TabHeader>

      {scimEnabled ? (
        <ScimConfigStub />
      ) : (
        <Alert type={'info'}>
          {
            'SCIM provisioning is currently disabled. Enable it to provision users automatically from your identity provider.'
          }
        </Alert>
      )}
    </div>
  );
};

export default AuthenticationTab;
