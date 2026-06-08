import { useQuery } from '@apollo/client';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import {
  GetFormCustomisationDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import InstantiateEnterpriseRiskModal from 'src/components/instantiate-enterprise-risk-modal/InstantiateEnterpriseRiskModal';
import PageFilterContainer from 'src/components/page-filter-container/PageFilterContainer';
import PropertyFilterPanel from 'src/components/property-filter-panel';
import { useGetEnterpriseRisksRegister } from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useAddCustomAttributes } from '@/utils/table/hooks/useAddCustomAttributes';
import { useCreateFilterOptions } from '@/utils/table/hooks/useCreateFilterOptions';
import { useCreateFilterProperties } from '@/utils/table/hooks/useCreateFilterProperties';
import { addEnterpriseRiskUrl } from '@/utils/urls';

import { useGetFieldConfig } from '../config';
import { useLabelledFields } from '../useLabelledFields';
import styles from './style.module.scss';
import Tier from './Tier';
import { type DashboardState, EnterpriseRiskAttribute } from './types';

const initialDashboardState = new Map<number, string | undefined>(
  Array.from({ length: 3 }, (_, i) => [i + 1, undefined])
);

const Page: FC = () => {
  useI18NSummaryHelpContent('enterpriseRisks.dashboardHelp');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'enterpriseRisks',
  });
  const title = t('dashboardTitle');

  const [dashboardState, setDashboardState] = useState<DashboardState>(
    initialDashboardState
  );

  const options: SelectProps.Option[] = [
    {
      label: t('columns.inherentRatingMean'),
      value: EnterpriseRiskAttribute.InherentMean,
    },
    {
      label: t('columns.residualRatingMean'),
      value: EnterpriseRiskAttribute.ResidualMean,
    },
    {
      label: t('columns.inherentRatingWorstCase'),
      value: EnterpriseRiskAttribute.InherentWorstCase,
    },
    {
      label: t('columns.residualRatingWorstCase'),
      value: EnterpriseRiskAttribute.ResidualWorstCase,
    },
  ];
  const [selectedOption, setSelectOption] = useState<SelectProps.Option>(
    options[0]
  );
  const fields = useGetFieldConfig();
  const [selectedRiskId1, setSelectedRiskId1] = useState<string | undefined>();
  const [selectedRiskId2, setSelectedRiskId2] = useState<string | undefined>();
  const [selectedRiskId3, setSelectedRiskId3] = useState<string | undefined>();

  const { data } = useGetEnterpriseRisksRegister({ queryArgs: {} });

  const { data: formCustomisation } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: [Parent_Type_Enum.Risk],
    },
  });

  const [showInstantiateModal, setShowInstantiateModal] = useState(false);
  const labelledFields = useLabelledFields(data?.enterprise_risk);
  const { tableFields, tableData } = useAddCustomAttributes({
    fields,
    data: labelledFields,
    customAttributeSchema:
      formCustomisation?.form_configuration?.[0]?.customAttributeSchema ?? null,
    useRelativeDates: true,
  });
  const filteringProperties = useCreateFilterProperties(
    tableFields,
    formCustomisation?.form_configuration ?? null
  );

  const { items, propertyFilterProps } = useCollection(tableData, {
    propertyFiltering: {
      filteringProperties,
    },
    selection: {},
  });
  const fixedFilterOptions = useCreateFilterOptions(
    tableFields,
    tableData,
    propertyFilterProps.filteringOptions
  );
  const selectedItems = useMemo(() => {
    if (selectedRiskId3) {
      return [selectedRiskId3];
    }
    if (selectedRiskId2) {
      return [selectedRiskId2];
    }
    if (selectedRiskId1) {
      return [selectedRiskId1];
    }

    return [];
  }, [selectedRiskId1, selectedRiskId2, selectedRiskId3]);

  // Select the first tier 1 risk on initial load
  useEffect(() => {
    if (!data) {
      return;
    }
    const firstTier1Risk = data.enterprise_risk.find((r) => r.Tier === 1);
    if (firstTier1Risk && selectedItems.length === 0) {
      initialDashboardState.set(1, firstTier1Risk?.Id);
      setDashboardState(initialDashboardState);
    }
  }, [data, selectedItems.length]);

  return (
    <PageLayout
      actions={
        <Permission
          permission={'insert:risk'}
          canHaveAccessAsContributor={true}
        >
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'primary'} href={addEnterpriseRiskUrl()}>
              {t('createNewButton')}
            </Button>
            <Button
              variant={selectedItems.length === 0 ? undefined : 'primary'}
              disabled={!selectedItems.length}
              onClick={() => setShowInstantiateModal(true)}
            >
              {t('instantiateButton')}
            </Button>
          </SpaceBetween>
        </Permission>
      }
      title={title}
    >
      <PageFilterContainer>
        <div className={'flex w-full space-x-2'}>
          <div className={'grow'}>
            <PropertyFilterPanel
              {...propertyFilterProps}
              filteringOptions={fixedFilterOptions}
              i18nStrings={defaultPropertyFilterI18nStrings}
              virtualScroll={true}
            />
          </div>
          <div>
            <Select
              selectedOption={selectedOption}
              onChange={(e) => setSelectOption(e.detail.selectedOption)}
              options={options}
            />
          </div>
        </div>
      </PageFilterContainer>
      <div className={styles.dashboard}>
        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          <Tier
            tier={1}
            tierRisks={items}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
            selectedRiskAttribute={
              selectedOption.value as EnterpriseRiskAttribute
            }
            onSelectionChange={(id) => setSelectedRiskId1(id)}
          />
          <Tier
            tier={2}
            tierRisks={items}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
            selectedRiskAttribute={
              selectedOption.value as EnterpriseRiskAttribute
            }
            onSelectionChange={(id) => setSelectedRiskId2(id)}
          />
          <Tier
            tier={3}
            tierRisks={items}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
            selectedRiskAttribute={
              selectedOption.value as EnterpriseRiskAttribute
            }
            onSelectionChange={(id) => setSelectedRiskId3(id)}
          />
        </Grid>
        <InstantiateEnterpriseRiskModal
          isVisible={showInstantiateModal}
          onDismiss={() => {
            setShowInstantiateModal(false);
          }}
          enterpriseRiskIds={selectedItems}
        />
      </div>
    </PageLayout>
  );
};

export default Page;
