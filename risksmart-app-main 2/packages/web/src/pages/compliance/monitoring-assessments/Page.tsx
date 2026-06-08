import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { handleError } from '@/utils/errorUtils';
import { complianceMonitoringAssessmentAddUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const ComplianceMonitoringAssessmentsPage: FC = () => {
  const { addNotification } = useNotifications();
  const { t: st } = useTranslation('common', {
    keyPrefix: 'complianceMonitoringAssessment',
  });
  const { data, loading } = useQuery(
    GetComplianceMonitoringAssessmentsDocument,
    {
      onError: (error) => {
        handleError(error);
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );
  const tableProps = useGetCollectionTableProps(
    data?.compliance_monitoring_assessment
  );
  const assessmentCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${data?.compliance_monitoring_assessment?.length})`;
  }, [data, loading]);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'complianceMonitoringAssessment.registerHelp'}
      title={title}
      counter={assessmentCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:compliance_monitoring_assessment'}>
            <Button
              variant={'primary'}
              href={complianceMonitoringAssessmentAddUrl()}
            >
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
        parentType={Parent_Type_Enum.ComplianceMonitoringAssessment}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default ComplianceMonitoringAssessmentsPage;
