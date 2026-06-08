import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  GetAppetitesGroupedByImpactDocument,
  GetImpactRatingsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';

import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import ImpactRatingModal from './ImpactRatingModal';

const Page: FC = () => {
  const [selectedRatingId, setSelectedRatingId] = useState<string>();
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impactRatings' });
  const { addNotification } = useNotifications();
  const { data, loading } = useQuery(GetImpactRatingsDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const { data: impactAppetites, loading: loadingImpactAppetites } = useQuery(
    GetAppetitesGroupedByImpactDocument
  );

  const tableProps = useGetCollectionTableProps(
    data?.impact_rating,
    impactAppetites?.impact,
    (item) => setSelectedRatingId(item.Id)
  );

  const counter = getCounter(
    tableProps.totalItemsCount,
    loading || loadingImpactAppetites
  );
  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'impactRatings.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton tableProps={tableProps} entityLabel={title} />
        </SpaceBetween>
      }
    >
      <Table {...tableProps} loading={loading || loadingImpactAppetites} />
      {selectedRatingId && (
        <ImpactRatingModal
          impactRatingId={selectedRatingId}
          onDismiss={() => setSelectedRatingId(undefined)}
          onSaving={() => Promise.reject()}
        />
      )}
    </PageLayout>
  );
};

export default Page;
