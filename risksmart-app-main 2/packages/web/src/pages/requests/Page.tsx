import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { PageLayout } from 'src/layouts';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetChangeRequests } from '@/hooks/queries/change-request/useGetChangeRequests';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import type { ChangeRequestRegisterFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page = () => {
  const location = useLocation();
  const { t } = useTranslation('common', { keyPrefix: 'requests' });
  const { user } = useRisksmartUser();
  const { data, loading } = useGetChangeRequests({
    queryArgs: { currentUserId: user?.userId ?? '' },
    shouldSkip: !user?.userId,
  });
  const [selectedItems, setSelectedItems] = useState<
    ChangeRequestRegisterFields[]
  >([]);
  const tableProps = useGetCollectionTableProps(data);
  const counter = getCounter(tableProps.totalItemsCount, loading);

  const { ribbonProps } = useRibbonAndExport(useGetDefaultRibbonFilters);

  useEffect(() => {
    const isFromRedirect = !!location.hash;

    if (!isFromRedirect) {
      tableProps.actions.setPropertyFiltering({
        tokens: [
          {
            propertyKey: 'RequiresAction',
            value: 'true',
            operator: '=',
          },
        ],
        operation: 'and',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <PageLayout
      helpTranslationKey={'requests.registerHelp'}
      title={t('register_title')}
      counter={counter}
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.ChangeRequest}
        {...ribbonProps}
      />
      <Table
        {...tableProps}
        selectionType={'multi'}
        selectedItems={selectedItems}
        onSelectionChange={(e) => setSelectedItems(e.detail.selectedItems)}
        trackBy={'Id'}
      />
    </PageLayout>
  );
};

export default Page;
