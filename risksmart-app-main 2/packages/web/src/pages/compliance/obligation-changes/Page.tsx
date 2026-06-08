import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetObligationChangesRegister } from '@/hooks/queries/obligation-change/useGetObligationChangesRegister';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const ObligationChangesPage: FC = () => {
  const { t: st } = useTranslation('common', {
    keyPrefix: 'obligationChanges',
  });
  const { data, loading } = useGetObligationChangesRegister({
    queryArgs: {},
  });
  const tableProps = useGetCollectionTableProps(data?.obligation_change);
  const recordCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${data?.obligation_change?.length ?? 0})`;
  }, [data, loading]);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'obligationChanges.registerHelp'}
      title={title}
      counter={recordCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
        </SpaceBetween>
      }
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.ObligationChange}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default ObligationChangesPage;
