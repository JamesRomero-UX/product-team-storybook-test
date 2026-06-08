import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import ExportButton from 'src/components/export-button';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';

import { useGetAcceptancesRegister } from '@/hooks/queries';
import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const { t } = useTranslation(['common']);
  const title = t('acceptances.register_title');
  const { data, loading } = useGetAcceptancesRegister({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(data?.acceptance);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'acceptances.help'}
      title={title}
      counter={getCounter(tableProps.totalItemsCount, loading)}
      actions={
        <ExportButton
          tableProps={tableProps}
          entityLabel={title}
          {...ribbonExportProps}
        />
      }
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.Acceptance}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default Page;
