import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { useGetDefaultRibbonFilters } from 'src/pages/controls/useGetDefaultRibbonFilters';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetControlsRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import TestResultModal from './update/tabs/TestResultModal';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openTestResult, setOpenTestResult] = useState<
    { controlId: string; ratingId: string } | undefined
  >();

  const { data, loading, refetch } = useGetControlsRegister({
    queryArgs: {},
  });
  const handleTestResultModalClose = () => {
    setOpenTestResult(undefined);
    setIsEditOpen(false);
    refetch();
  };

  const tableProps = useGetCollectionTableProps((testResult) => {
    setOpenTestResult(testResult);
    setIsEditOpen(true);
  }, data?.control);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const counter = getCounter(tableProps.totalItemsCount, loading);
  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'controls.registerHelp'}
      title={title}
      counter={counter}
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
        parentType={Parent_Type_Enum.Control}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
      {isEditOpen && openTestResult && (
        <TestResultModal
          parentControlId={openTestResult.controlId}
          Id={openTestResult.ratingId}
          onDismiss={handleTestResultModalClose}
          assessmentMode={'rating'}
        />
      )}
    </PageLayout>
  );
};

export default Page;
