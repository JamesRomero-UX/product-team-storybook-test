import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import ExportButton from 'src/components/export-button';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useGetInternalAuditEntitiesRegister } from '@/hooks/queries';
import { internalAuditAddUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const InternalAuditsPage: FC = () => {
  const { t: st } = useTranslation('common', { keyPrefix: 'internalAudits' });
  const { data, loading } = useGetInternalAuditEntitiesRegister({
    queryArgs: {},
  });
  const tableProps = useGetCollectionTableProps(data?.internal_audit_entity);
  const internalAuditCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${data?.internal_audit_entity?.length})`;
  }, [data, loading]);

  const title = st('register_title');

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'internalAudits.registerHelp'}
      title={title}
      counter={internalAuditCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:internal_audit_entity'}>
            <Button variant={'primary'} href={internalAuditAddUrl()}>
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
        parentType={Parent_Type_Enum.InternalAuditEntity}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default InternalAuditsPage;
