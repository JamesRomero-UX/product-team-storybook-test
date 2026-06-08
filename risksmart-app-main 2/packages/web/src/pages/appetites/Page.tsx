import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import ExportButton from 'src/components/export-button';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';

import { useGetAppetitesRegister } from '@/hooks/queries';
import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'appetites' });
  const title = st('register_title');
  const { data, loading } = useGetAppetitesRegister({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(data?.appetite_parent);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'appetites.help'}
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
        parentType={Parent_Type_Enum.Appetite}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default Page;
