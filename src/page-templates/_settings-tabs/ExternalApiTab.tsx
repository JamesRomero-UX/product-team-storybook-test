// Settings → External API tab
//
// Mirrors pages/settings/tabs/external-api/Tab.tsx + config.tsx.
//
// Production layout (verbatim shape):
//   <Table {...tableProps}
//     header={
//       <SpaceBetween size='m'>
//         <TabHeader actions={Delete + Add}>API clients</TabHeader>
//         <SpaceBetween size='xs'>
//           [Alert: max clients warning — when isCreateDisabled && rows>0]
//           <Box margin={{ bottom: 'xs' }}>
//             <Alert type='info'>info_message <br /> Link external docs</Alert>
//           </Box>
//         </SpaceBetween>
//       </SpaceBetween>
//     }
//     variant='embedded' selectionType='multi' trackBy='clientId'
//   />
//
// Production initialColumns (from config.tsx):
//   ['name', 'clientId', 'apiVersion', 'status']

import { useCollection } from '@cloudscape-design/collection-hooks';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

type ApiClient = {
  clientId: string;
  name: string;
  apiVersion: 'v1' | 'v2';
  status: 'active' | 'revoked';
};

const SAMPLE: ApiClient[] = [
  { clientId: 'cid_4f8a1b2c3d4e5f6a', name: 'Workato integration',  apiVersion: 'v2', status: 'active' },
  { clientId: 'cid_a1b2c3d4e5f67890', name: 'Internal sync (read)', apiVersion: 'v2', status: 'active' },
  { clientId: 'cid_998877665544aabb', name: 'Acme Zapier',          apiVersion: 'v1', status: 'active' },
  { clientId: 'cid_deadbeefcafe0011', name: 'Legacy export script', apiVersion: 'v1', status: 'revoked' },
];

const MAX_CLIENTS = 5;

const COLUMNS = [
  {
    id: 'name',
    header: 'Name',
    cell: (c: ApiClient) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
      >
        {c.name}
      </a>
    ),
    isRowHeader: true,
    sortingField: 'name',
    minWidth: 220,
  },
  {
    id: 'clientId',
    header: 'Client ID',
    cell: (c: ApiClient) => <span className={'font-mono text-sm'}>{c.clientId}</span>,
    sortingField: 'clientId',
    minWidth: 260,
  },
  {
    id: 'apiVersion',
    header: 'API version',
    cell: (c: ApiClient) => c.apiVersion,
    sortingField: 'apiVersion',
    minWidth: 120,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (c: ApiClient) => (
      <StatusIndicator type={c.status === 'active' ? 'success' : 'stopped'}>
        {c.status}
      </StatusIndicator>
    ),
    sortingField: 'status',
    minWidth: 120,
  },
];

const ExternalApiTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {}, selection: {} });
  const [selected, setSelected] = useState<ApiClient[]>([]);

  const isCreateDisabled = collection.items.length >= MAX_CLIENTS;

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'clientId'}
      variant={'embedded'}
      selectionType={'multi'}
      selectedItems={selected}
      onSelectionChange={({ detail }) =>
        setSelected(detail.selectedItems as ApiClient[])
      }
      loadingText={'Loading API clients'}
      header={
        <SpaceBetween size={'m'}>
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button disabled={selected.length === 0}>{'Delete'}</Button>
                <Button variant={'primary'} disabled={isCreateDisabled}>
                  {'Add'}
                </Button>
              </SpaceBetween>
            }
          >
            {'API clients'}
          </TabHeader>
          <SpaceBetween size={'xs'}>
            {isCreateDisabled && collection.items.length > 0 ? (
              <Alert type={'warning'}>
                {`You have reached the maximum of ${MAX_CLIENTS} API clients. Delete an existing client to add a new one.`}
              </Alert>
            ) : null}
            <Box margin={{ bottom: 'xs' }}>
              <Alert type={'info'}>
                {
                  'Use API clients to authenticate external integrations with the RiskSmart REST API.'
                }
                <br />
                <Link
                  href={'https://docs.risksmart.com/external-api'}
                  external
                  target={'_blank'}
                  rel={'noopener noreferrer'}
                >
                  {'View documentation'}
                </Link>
              </Alert>
            </Box>
          </SpaceBetween>
        </SpaceBetween>
      }
    />
  );
};

export default ExternalApiTab;
