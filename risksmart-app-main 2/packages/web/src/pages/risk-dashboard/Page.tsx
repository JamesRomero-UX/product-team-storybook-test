import { useQuery } from '@apollo/client';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import {
  GetAppetitesGroupedByImpactDocument,
  GetFormCustomisationDocument,
  GetRisksFlatDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'src/components/form/select';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import PageFilterContainer from 'src/components/page-filter-container/PageFilterContainer';
import PropertyFilterPanel from 'src/components/property-filter-panel';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useRiskScores } from '@/hooks/useRiskScore';
import { useAddCustomAttributes } from '@/utils/table/hooks/useAddCustomAttributes';
import { useCreateFilterOptions } from '@/utils/table/hooks/useCreateFilterOptions';
import { useCreateFilterProperties } from '@/utils/table/hooks/useCreateFilterProperties';
import { addRiskUrl } from '@/utils/urls';

import { useGetFieldConfig } from '../risks/config';
import { useGetLabelledFields } from '../risks/useGetLabelledFields';
import styles from './style.module.scss';
import Tier from './Tier';
import type { DashboardState } from './types';
import { RiskAttribute } from './types';

const initialDashboardState = new Map<number, string | undefined>(
  Array.from({ length: 3 }, (_, i) => [i + 1, undefined])
);

const Page: FC = () => {
  useI18NSummaryHelpContent('risks.dashboardHelp');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'risks',
  });
  const title = t('dashboard_title');

  const [dashboardState, setDashboardState] = useState<DashboardState>(
    initialDashboardState
  );
  const fields = useGetFieldConfig();
  const { addNotification } = useNotifications();

  const { entityIds } = useEntityFilter();

  const whereFilter = useMemo(() => {
    if (!entityIds || !entityIds.length) {
      return {};
    }

    return {
      enterpriseRiskInstance: {
        EntityId: { _in: entityIds },
      },
    };
  }, [entityIds]);

  const { data } = useQuery(GetRisksFlatDocument, {
    variables: {
      where: whereFilter,
    },
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
    onCompleted: (data) => {
      // Select the first tier 1 risk
      const firstTier1Risk = data.risk.find((r) => r.Tier === 1);
      if (firstTier1Risk) {
        initialDashboardState.set(1, firstTier1Risk?.Id);
        setDashboardState(initialDashboardState);
      }
    },
  });

  const { data: formCustomisation } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: [Parent_Type_Enum.EnterpriseRisk],
    },
  });

  const { scores } = useRiskScores();
  const { data: impactAppetites } = useQuery(
    GetAppetitesGroupedByImpactDocument
  );
  const labelledFields = useGetLabelledFields(
    data?.risk,
    scores,
    impactAppetites?.impact
  );
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
  const isImpactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const fixedFilterOptions = useCreateFilterOptions(
    tableFields,
    tableData,
    propertyFilterProps.filteringOptions
  );

  // TODO: should we removed controlled rating, uncontrolled rating when impacts enabled?
  const options: SelectProps.Option[] = [
    {
      label: t('columns.controlled_rating'),
      value: RiskAttribute.ControlledRating,
    },
    {
      label: t('columns.uncontrolled_rating'),
      value: RiskAttribute.UncontrolledRating,
    },

    {
      label: t('columns.appetite_performance'),
      value: RiskAttribute.AppetitePerformance,
    },
    ...(isImpactsEnabled
      ? [
          {
            label: t('columns.impact_performance'),
            value: RiskAttribute.ImpactPerformance,
          },
        ]
      : []),
    {
      label: t('columns.risk_status'),
      value: RiskAttribute.RiskStatus,
    },
  ];
  const [selectedOption, setSelectOption] = useState<SelectProps.Option>(
    options[0]
  );

  return (
    <PageLayout
      actions={
        <Permission
          permission={'insert:risk'}
          canHaveAccessAsContributor={true}
        >
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button variant={'primary'} href={addRiskUrl()}>
              {t('create_new_button')}
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
            selectedRiskAttribute={selectedOption.value as RiskAttribute}
            tierRisks={items}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
          />
          <Tier
            tier={2}
            selectedRiskAttribute={selectedOption.value as RiskAttribute}
            tierRisks={items}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
          />
          <Tier
            tier={3}
            selectedRiskAttribute={selectedOption.value as RiskAttribute}
            tierRisks={items}
            dashboardState={dashboardState}
            setDashboardState={setDashboardState}
          />
        </Grid>
      </div>
    </PageLayout>
  );
};

export default Page;
