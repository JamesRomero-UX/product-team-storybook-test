import Table from '@risksmart-app/components/src/table';
import {
  type GetPolicyAttestationRecordsQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import ExportButton from 'src/components/export-button';
import TabHeader from 'src/components/tab-header';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';
import { getCounter } from 'src/utils';

import { useGetRegisterTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

export interface AllViewProps {
  attestationsRegisterData: GetPolicyAttestationRecordsQuery | undefined;
  loading: boolean;
  viewSelector: React.ReactNode;
  title: string;
  subTitle?: string;
}

const View: React.FC<AllViewProps> = ({
  attestationsRegisterData,
  loading,
  viewSelector,
  title,
  subTitle,
}) => {
  const tableProps = useGetRegisterTableProps(
    attestationsRegisterData?.attestation_record
  );

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const header = (
    <div className={'flex justify-between'}>
      <TabHeader>{subTitle}</TabHeader>
      {viewSelector}
    </div>
  );

  return (
    <PageLayout
      helpTranslationKey={'policy.registerHelp'}
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
        parentType={Parent_Type_Enum.AttestationRecord}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} header={header} />
    </PageLayout>
  );
};

export default View;
