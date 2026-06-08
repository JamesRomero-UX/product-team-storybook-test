import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Table from '@risksmart-app/components/src/table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from 'src/layouts';

import { useGetPublicDocumentFiles } from '@/hooks/queries';

import ViewSelector from '../../../components/view-selector';
import CardView from './CardView';
import { useGetCollectionTableProps } from './config';

const PublicPoliciesPage = () => {
  const { user } = useRisksmartUser();
  const { t } = useTranslation(['common'], { keyPrefix: 'publicPolicies' });
  const { data, loading } = useGetPublicDocumentFiles({
    queryArgs: { userId: user?.userId! },
    shouldSkip: !user?.userId,
  });

  type View = 'card' | 'table';
  const viewOptions: { text: string; id: View }[] = [
    { text: t('viewSelector.table'), id: 'table' },
    { text: t('viewSelector.card'), id: 'card' },
  ];

  const collectionProps = useGetCollectionTableProps(data?.document_file);
  const [selectedView, setSelectedView] = useState<View>('table');

  return (
    <PageLayout title={t('register_title')} actions={<></>}>
      {selectedView === 'table' && (
        <Table
          {...collectionProps}
          loading={loading}
          header={
            <ViewSelector<View>
              selectedView={selectedView}
              onSelectedViewChanged={(view) => {
                collectionProps.actions.setSorting?.({
                  isDescending: true,
                  sortingColumn: {
                    sortingField: 'ModifiedAtTimestamp',
                  },
                });
                setSelectedView(view);
              }}
              options={viewOptions}
            />
          }
        />
      )}
      {selectedView === 'card' && (
        <CardView
          pagination={collectionProps.pagination}
          items={collectionProps.items}
          empty={collectionProps.empty}
          filter={collectionProps.filter}
          header={
            <ViewSelector<View>
              selectedView={selectedView}
              onSelectedViewChanged={setSelectedView}
              options={viewOptions}
            />
          }
        />
      )}
    </PageLayout>
  );
};

export default PublicPoliciesPage;
