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
import { useGetInternalAuditReportsRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { internalAuditReportAddUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const InternalAuditReportPage: FC = () => {
  const { t: st } = useTranslation('common', {
    keyPrefix: 'internalAuditReports',
  });
  const { data, loading } = useGetInternalAuditReportsRegister({
    queryArgs: {},
  });
  const tableProps = useGetCollectionTableProps(data?.internal_audit_report);
  const assessmentCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${data?.internal_audit_report?.length})`;
  }, [data, loading]);

  const title = st('register_title');

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'internalAuditReports.registerHelp'}
      title={title}
      counter={assessmentCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:internal_audit_report'}>
            <Button variant={'primary'} href={internalAuditReportAddUrl()}>
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
        parentType={Parent_Type_Enum.InternalAuditReport}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default InternalAuditReportPage;
