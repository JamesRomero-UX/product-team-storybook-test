import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetIndicatorRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'indicators',
  });
  const { data, loading } = useGetIndicatorRegister({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(data?.indicator);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'indicators.registerHelp'}
      title={title}
      counter={getCounter(tableProps.totalItemsCount, loading)}
      actions={
        <ExportButton
          tableProps={tableProps}
          entityLabel={title}
          {...ribbonExportProps}
        />
      }
      meta={{
        title: title,
      }}
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.Indicator}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default Page;
