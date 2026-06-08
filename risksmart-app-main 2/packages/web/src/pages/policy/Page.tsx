import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetPolicyRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';
import { addPolicyUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './defaultRibbonFilters';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'policy',
  });
  const title = st('register_title');
  const { data, loading } = useGetPolicyRegister({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(
    data?.document,
    data?.assessment_result_parent.map((ar) => ar.documentAssessmentResult)
  );

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'policy.registerHelp'}
      title={title}
      counter={getCounter(tableProps.totalItemsCount, loading)}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:document'}>
            <Button variant={'primary'} href={addPolicyUrl()}>
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
        parentType={Parent_Type_Enum.Document}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default Page;
