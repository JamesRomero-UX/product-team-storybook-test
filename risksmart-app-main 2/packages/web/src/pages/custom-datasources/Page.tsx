import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import { GetCustomDatasourcesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';
import { handleError } from '@/utils/errorUtils';
import { addCustomDatasourceUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'customDatasources',
  });

  const { addNotification } = useNotifications();
  const { data, loading } = useQuery(GetCustomDatasourcesDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      handleError(error);
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const tableProps = useGetCollectionTableProps(data?.custom_datasource);

  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'customDatasources.registerHelp'}
      title={title}
      counter={getCounter(tableProps.totalItemsCount, loading)}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton tableProps={tableProps} entityLabel={title} />
          <Permission permission={'insert:custom_datasource'}>
            <Button variant={'primary'} href={addCustomDatasourceUrl()}>
              {st('create_new_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
      meta={{
        title: st('register_title'),
      }}
    >
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default Page;
