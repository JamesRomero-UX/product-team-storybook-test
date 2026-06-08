import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import InstantiateEnterpriseRiskModal from 'src/components/instantiate-enterprise-risk-modal/InstantiateEnterpriseRiskModal';
import { useGetEnterpriseRisksRegister } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRisksRegister';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';
import { addEnterpriseRiskUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './defaultRibbonFilters';
import type { EnterpriseRiskRegisterFields } from './types';

const EnterpriseRiskPage: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'enterpriseRisks' });

  const { data, loading } = useGetEnterpriseRisksRegister({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(data?.enterprise_risk);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const [selectedItems, setSelectedItems] = useState<
    Array<EnterpriseRiskRegisterFields>
  >([]);

  const [showInstantiateModal, setShowInstantiateModal] = useState(false);

  const counter = getCounter(tableProps.totalItemsCount, loading);

  const title = t('registerTitle');

  return (
    <PageLayout
      title={title}
      helpTranslationKey={'enterpriseRisks.registerHelp'}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:enterprise_risk'}>
            <Button variant={'primary'} href={addEnterpriseRiskUrl()}>
              {t('createNewButton')}
            </Button>
          </Permission>
          <Permission permission={'insert:enterprise_risk'}>
            <Button
              variant={selectedItems.length === 0 ? undefined : 'primary'}
              disabled={!selectedItems.length}
              onClick={() => setShowInstantiateModal(true)}
            >
              {t('instantiateButton')}
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
        parentType={Parent_Type_Enum.EnterpriseRisk}
        {...ribbonProps}
      />
      <Table
        {...tableProps}
        data-testid={'enterprise-risk-table'}
        trackBy={'Id'}
        loading={loading}
        selectedItems={selectedItems}
        selectionType={'multi'}
        onSelectionChange={({ detail }) => {
          setSelectedItems(detail.selectedItems);
        }}
      />
      {showInstantiateModal && (
        <InstantiateEnterpriseRiskModal
          isVisible={showInstantiateModal}
          onDismiss={() => {
            setShowInstantiateModal(false);
          }}
          enterpriseRiskIds={selectedItems.map((si) => si.Id)}
        />
      )}
    </PageLayout>
  );
};

export default EnterpriseRiskPage;
