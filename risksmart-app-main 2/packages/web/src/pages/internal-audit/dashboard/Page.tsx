import { useQuery } from '@apollo/client';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import {
  GetAppetitesGroupedByImpactDocument,
  GetFormCustomisationDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'src/components/form/select';
import PageFilterContainer from 'src/components/page-filter-container/PageFilterContainer';
import PropertyFilterPanel from 'src/components/property-filter-panel';
import { PageLayout } from 'src/layouts';
import { RiskAttribute } from 'src/pages/risk-dashboard/types';
import { Permission } from 'src/rbac/Permission';

import {
  useGetInternalAuditEntitiesRegister,
  useGetLinkedRisksByInternalAuditId,
} from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useRiskScores } from '@/hooks/useRiskScore';
import { useAddCustomAttributes } from '@/utils/table/hooks/useAddCustomAttributes';
import { useCreateFilterOptions } from '@/utils/table/hooks/useCreateFilterOptions';
import { useCreateFilterProperties } from '@/utils/table/hooks/useCreateFilterProperties';
import { internalAuditAddUrl } from '@/utils/urls';

import { useGetCollectionTableProps } from '../../risks/config';
import { useGetFieldConfig } from '../config';
import { useLabelledFields } from '../useLabelledFields';
import RiskType from './RiskType';
import Type from './Type';

const Page: FC = () => {
  const { t } = useTranslation();
  const { t: rt } = useTranslation(['common'], {
    keyPrefix: 'risks',
  });
  const title = t('internalAudits.universe.title');
  const isImpactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const [selectedBusinessAreaId, setSelectedBusinessAreaId] =
    useState<string>();
  const [selectedInternalAuditEntityId, setSelectedInternalAuditEntityId] =
    useState<string>();
  const {
    data: internalAuditsData,
    loading: loadingInternalAudits,
    refetch,
  } = useGetInternalAuditEntitiesRegister({ queryArgs: {} });
  const { data: riskData, loading: loadingRisks } =
    useGetLinkedRisksByInternalAuditId({
      queryArgs: { internalAuditId: selectedInternalAuditEntityId ?? '' },
      shouldSkip: !selectedInternalAuditEntityId,
    });

  const { data: formCustomisation } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: [Parent_Type_Enum.InternalAuditEntity],
    },
  });

  const { loading: loadingScores, scores } = useRiskScores();

  const labelledFields = useLabelledFields(
    internalAuditsData?.internal_audit_entity
  );
  const fields = useGetFieldConfig();
  const { tableFields, tableData } = useAddCustomAttributes({
    fields,
    data: labelledFields,
    customAttributeSchema:
      formCustomisation?.form_configuration?.[0]?.customAttributeSchema ?? null,
    useRelativeDates: false,
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
  const { data: impactAppetites } = useQuery(
    GetAppetitesGroupedByImpactDocument
  );
  const riskRegisterFields = useGetCollectionTableProps(
    riskData?.linked_risks?.map((c) => c.risk!) ?? [],
    scores,
    impactAppetites?.impact
  );

  const onSelectItem = async (
    id: string,
    type: 'businessArea' | 'internalAuditEntity'
  ) => {
    switch (type) {
      case 'businessArea':
        setSelectedBusinessAreaId(id);
        setSelectedInternalAuditEntityId(undefined);
        break;
      case 'internalAuditEntity':
        setSelectedInternalAuditEntityId(id);
        await refetch();
        break;
    }
  };

  const options: SelectProps.Option[] = [
    {
      label: rt('columns.controlled_rating'),
      value: RiskAttribute.ControlledRating,
    },
    {
      label: rt('columns.uncontrolled_rating'),
      value: RiskAttribute.UncontrolledRating,
    },

    {
      label: rt('columns.appetite_performance'),
      value: RiskAttribute.AppetitePerformance,
    },
    ...(isImpactsEnabled
      ? [
          {
            label: rt('columns.impact_performance'),
            value: RiskAttribute.ImpactPerformance,
          },
        ]
      : []),
    {
      label: rt('columns.risk_status'),
      value: RiskAttribute.RiskStatus,
    },
  ];
  const [selectedOption, setSelectOption] = useState<SelectProps.Option>(
    options[0]
  );

  return (
    <PageLayout
      helpTranslationKey={'internalAudits.universe.help'}
      title={title}
      pageTitle={title}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission permission={'insert:internal_audit_entity'}>
            <Button variant={'primary'} href={internalAuditAddUrl()}>
              {t('internalAudits.universe.create_new_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
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
      <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
        <Type
          loading={loadingInternalAudits}
          internalAudits={items}
          type={'businessArea'}
          onSelectAction={onSelectItem}
        />
        <Type
          loading={loadingInternalAudits}
          internalAudits={items}
          type={'internalAuditEntity'}
          selectedId={selectedBusinessAreaId}
          onSelectAction={onSelectItem}
        />
        <RiskType
          risks={riskRegisterFields.items}
          loading={loadingRisks || loadingScores}
          selectedInternalAuditEntityId={selectedInternalAuditEntityId}
          selectedRiskAttribute={selectedOption.value as RiskAttribute}
        />
      </Grid>
    </PageLayout>
  );
};

export default Page;
