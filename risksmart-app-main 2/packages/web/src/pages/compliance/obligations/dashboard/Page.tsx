import { useQuery } from '@apollo/client';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import {
  GetFormCustomisationDocument,
  GetLatestObligationAssessmentResultsDocument,
  Obligation_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageFilterContainer from 'src/components/page-filter-container/PageFilterContainer';
import PropertyFilterPanel from 'src/components/property-filter-panel';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useGetObligationsRegister } from '@/hooks/queries';
import { useAddCustomAttributes } from '@/utils/table/hooks/useAddCustomAttributes';
import { useCreateFilterOptions } from '@/utils/table/hooks/useCreateFilterOptions';
import { useCreateFilterProperties } from '@/utils/table/hooks/useCreateFilterProperties';
import { addObligationUrl } from '@/utils/urls';

import { useGetFieldConfig } from '../config';
import { useGetLabelledFields } from '../useLabelledFields';
import Type from './Type';

const Page: FC = () => {
  const { t } = useTranslation();
  const title = t('obligations.dashboard_title');

  const [selectedChapterParentId, setSelectedChapterParentId] =
    useState<string>();
  const [selectedRuleParentId, setSelectedRuleParentId] = useState<string>();
  const [selectedTaskParentId, setSelectedTaskParentId] = useState<string>();
  const { addNotification } = useNotifications();
  const { data, loading: loadingObligations } = useGetObligationsRegister({
    queryArgs: {},
  });
  const { data: latestAssessmentResults, loading: loadingAssessments } =
    useQuery(GetLatestObligationAssessmentResultsDocument, {
      fetchPolicy: 'no-cache',
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    });

  const { data: formCustomisation } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: [Parent_Type_Enum.Obligation],
    },
  });

  const labelledFields = useGetLabelledFields(
    data?.obligation,
    latestAssessmentResults?.obligation_assessment_result
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

  const onSelectItem = (obligationId: string, type: Obligation_Type_Enum) => {
    switch (type) {
      case Obligation_Type_Enum.Standard:
        setSelectedChapterParentId(obligationId);
        setSelectedRuleParentId(undefined);
        setSelectedTaskParentId(undefined);
        break;
      case Obligation_Type_Enum.Chapter:
        setSelectedRuleParentId(obligationId);
        setSelectedTaskParentId(undefined);
        break;
      case Obligation_Type_Enum.Rule:
        setSelectedTaskParentId(obligationId);
        break;
    }
  };

  return (
    <PageLayout
      helpTranslationKey={'obligations.dashboardHelp'}
      title={title}
      pageTitle={title}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission
            permission={'insert:obligation'}
            canHaveAccessAsContributor={true}
          >
            <Button variant={'primary'} href={addObligationUrl()}>
              {t('obligations.create_new_button')}
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
        </div>
      </PageFilterContainer>
      <Grid
        gridDefinition={[
          { colspan: 3 },
          { colspan: 3 },
          { colspan: 3 },
          { colspan: 3 },
        ]}
      >
        <Type
          loading={loadingObligations || loadingAssessments}
          obligations={items}
          type={Obligation_Type_Enum.Standard}
          onSelectAction={onSelectItem}
        />
        <Type
          loading={loadingObligations || loadingAssessments}
          obligations={items}
          type={Obligation_Type_Enum.Chapter}
          selectedId={selectedChapterParentId}
          onSelectAction={onSelectItem}
        />
        <Type
          loading={loadingObligations || loadingAssessments}
          obligations={items}
          type={Obligation_Type_Enum.Rule}
          selectedId={selectedRuleParentId}
          onSelectAction={onSelectItem}
        />
        <Type
          loading={loadingObligations || loadingAssessments}
          obligations={items}
          type={Obligation_Type_Enum.Task}
          selectedId={selectedTaskParentId}
          onSelectAction={onSelectItem}
        />
      </Grid>
    </PageLayout>
  );
};

export default Page;
