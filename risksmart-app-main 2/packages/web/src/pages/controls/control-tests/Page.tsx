import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { useGetTestResults } from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';

import TestResultModal from '../update/tabs/TestResultModal';
import { useGetCollectionTableProps } from './config';
import type { ControlTestTableFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'testResults' });

  const { data, loading, refetch } = useGetTestResults({ queryArgs: {} });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | undefined>(
    undefined
  );
  const [selectedTestParentId, setSelectedTestParentId] = useState<
    string | undefined
  >(undefined);

  const handleTestResultModalOpen = (item: ControlTestTableFields) => {
    setIsEditOpen(true);
    setSelectedTestId(item.Id);
    setSelectedTestParentId(item.ParentControlId);
  };
  const handleTestResultModalClose = async (saved?: boolean | undefined) => {
    setIsEditOpen(false);

    if (saved) {
      await refetch();
    }
  };

  const tableProps = useGetCollectionTableProps(
    data?.test_result,
    handleTestResultModalOpen
  );
  const counter = getCounter(tableProps.totalItemsCount, loading);
  const title = st('register_title');

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'testResults.registerHelp'}
      title={title}
      counter={counter}
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
        parentType={Parent_Type_Enum.TestResult}
        {...ribbonProps}
      />

      <Table {...tableProps} loading={loading} />

      {isEditOpen && selectedTestId && (
        <TestResultModal
          parentControlId={selectedTestParentId || ''}
          Id={selectedTestId}
          onDismiss={handleTestResultModalClose}
          assessmentMode={'rating'}
        />
      )}
    </PageLayout>
  );
};

export default Page;
