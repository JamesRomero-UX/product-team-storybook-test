import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  GetImpactsDocument,
  InsertImpactDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { ownerIds } from 'src/components/form';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionTableProps } from './config';
import ImpactModal from './ImpactModal';

const Page: FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impacts' });
  const { addNotification } = useNotifications();
  const { data, loading, refetch } = useQuery(GetImpactsDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const [insert] = useMutation(InsertImpactDocument, {
    update: (cache) => {
      evictField(cache, 'impact_aggregate');
      evictField(cache, 'impact');
    },
  });

  const tableProps = useGetCollectionTableProps(data?.impact);

  const counter = getCounter(tableProps.totalItemsCount, loading);
  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'impacts.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton tableProps={tableProps} entityLabel={title} />
          <Permission permission={'insert:impact'}>
            <Button variant={'primary'} onClick={() => setIsModalVisible(true)}>
              {st('create_new_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <Table {...tableProps} loading={loading} />
      {isModalVisible && (
        <ImpactModal
          onDismiss={() => setIsModalVisible(false)}
          onSaving={async (data) => {
            await insert({
              variables: {
                object: {
                  RatingGuidance: data.RatingGuidance,
                  Rationale: data.Rationale,
                  Name: data.Name,
                  LikelihoodAppetite: data.LikelihoodAppetite,
                  ...ownerIds(data),
                },
              },
            });
            refetch();
          }}
        />
      )}
    </PageLayout>
  );
};

export default Page;
