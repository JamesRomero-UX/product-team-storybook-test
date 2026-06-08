import { useSubscription } from '@apollo/client';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Loading from '@risksmart-app/components/src/loading';
import Table from '@risksmart-app/components/src/table';
import { TppGetResponsesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { PageLayout } from 'src/layouts';

import { useColumnDefinitions } from './table.config';

const Page: FC = () => {
  const { data, loading } = useSubscription(TppGetResponsesDocument, {
    fetchPolicy: 'no-cache',
  });
  const columnDefinitions = useColumnDefinitions();
  const { items, collectionProps } = useCollection(
    data?.third_party_response ?? [],
    {
      propertyFiltering: {
        filteringProperties: [],
        empty: <div>{'You have no questionnaires'}</div>,
      },
      sorting: {
        defaultState: {
          sortingColumn: columnDefinitions[1],
        },
      },
    }
  );

  if (loading) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      actions={<></>}
      title={'Questionnaires'}
      meta={{
        title: 'Questionnaires',
      }}
    >
      <Table
        columnDefinitions={columnDefinitions}
        {...collectionProps}
        items={items}
        loading={false}
      />
    </PageLayout>
  );
};

export default Page;
