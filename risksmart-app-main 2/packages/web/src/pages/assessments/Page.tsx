import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetAssessmentsRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { assessmentAddUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const AssessmentsPage: FC = () => {
  const { t: st } = useTranslation('common', { keyPrefix: 'assessments' });
  const { data, loading } = useGetAssessmentsRegister({ queryArgs: {} });
  const tableProps = useGetCollectionTableProps(data?.assessment);
  const assessmentCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${data?.assessment?.length})`;
  }, [data, loading]);

  const title = st('register_title');

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'assessments.registerHelp'}
      title={title}
      counter={assessmentCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:assessment'}>
            <Button variant={'primary'} href={assessmentAddUrl()}>
              {st('create_new_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.Assessment}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default AssessmentsPage;
