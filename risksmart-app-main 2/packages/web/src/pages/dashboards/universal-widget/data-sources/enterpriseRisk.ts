import type { Colour } from '@risksmart-app/components/src/utils/colours';
import { colours } from '@risksmart-app/components/src/utils/colours';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { EnterpriseRiskRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetEnterpriseRisksQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Enterprise_Risk_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetEnterpriseRisksDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcEnterpriseRisksToGraphQL } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRisksRegister';
import { useGetEnterpriseRiskSmartWidgetTableProps } from 'src/pages/enterprise-risk/config';
import type { EnterpriseRiskRegisterFields } from 'src/pages/enterprise-risk/types';

import { enterpriseRiskRegisterUrl } from '@/utils/urls';

import { UNRATED } from '../../gigawidget/types';
import { dateRangeFilter } from '../../gigawidget/util/filterHelpers';
import { createDataSource } from '../createDataSource';
import {
  dashboardDateRangeClickthroughFilter,
  dateRangeClickthroughFilter,
  defaultClickthroughFilter,
} from '../dataSourceHelpers';

export default createDataSource<
  EnterpriseRiskRegisterFields,
  { where?: Enterprise_Risk_Bool_Exp | undefined },
  GetEnterpriseRisksQuery
>({
  hasAccess: (_, isModuleEnabled) => isModuleEnabled('enterprise_risk'),
  parentTypes: [Parent_Type_Enum.EnterpriseRisk],
  documentNode: GetEnterpriseRisksDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.enterpriseRisk.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: EnterpriseRiskRegisterResponse) => {
        return mapTrpcEnterpriseRisksToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => {
    return {};
  },
  useTablePropsHook: (data, options) => {
    return useGetEnterpriseRiskSmartWidgetTableProps(
      data?.enterprise_risk,
      options
    );
  },
  entityNamePlural: 'enterprise_risk_other',
  entityNameSingular: 'enterprise_risk_one',
  fields: 'enterpriseRisks.fields',
  dashboardFilterConfig: {
    tagsFilter: (_tags) => ({}),
    departmentsFilter: (_departments) => ({}),
    dateFilter: (_dateRange, _precision) => ({}),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
  },
  clickThroughUrl: (filter) => enterpriseRiskRegisterUrl(filter),
  categoryGetters: [
    {
      id: 'tier',
      name: () => i18n.t('risks.columns.risk_tier'),
      categoryGetter: (item) => item.TierLabelled,
      clickthroughFilter: defaultClickthroughFilter('TierLabelled'),
    },
    {
      id: 'treatment',
      name: () => i18n.t('risks.columns.risk_treatment'),
      categoryGetter: (item) => item.TreatmentLabelled,
      clickthroughFilter: defaultClickthroughFilter('TreatmentLabelled'),
    },
    {
      id: 'residualRatingMean',
      name: () => i18n.t('enterpriseRisks.columns.residualRatingMean'),
      categoryGetter: (item) => ({
        key: item.ResidualMeanLabelled ?? UNRATED,
        label: item.ResidualMeanLabelled ?? UNRATED,
        sortKey: item.ResidualMeanLabelled ?? UNRATED,
      }),
      ratingColourKey: 'risk_controlled',
      clickthroughFilter: defaultClickthroughFilter('ResidualMeanLabelled', {
        unratedValue: UNRATED,
      }),
      categoryOverrideFunction: (category, _ratingFns, riskFormatters) => {
        const rating = riskFormatters({
          residualRating: category.data[0]?.score?.ResidualRatingMean,
        }).getResidualOption();

        return {
          title: rating?.label ?? UNRATED,
          color:
            colours[(rating?.color ?? 'light-grey') as Colour]
              ?.backgroundColor ?? rating?.color,
        };
      },
    },
    {
      id: 'residualRatingWorstCase',
      name: () => i18n.t('enterpriseRisks.columns.residualRatingWorstCase'),
      categoryGetter: (item) => ({
        key: item.ResidualWorstCaseLabelled ?? UNRATED,
        label: item.ResidualWorstCaseLabelled ?? UNRATED,
        sortKey: item.ResidualWorstCaseLabelled ?? UNRATED,
      }),
      ratingColourKey: 'risk_controlled',
      clickthroughFilter: defaultClickthroughFilter(
        'ResidualWorstCaseLabelled',
        {
          unratedValue: UNRATED,
        }
      ),
      categoryOverrideFunction: (category, _ratingFns, riskFormatters) => {
        const rating = riskFormatters({
          residualRating: category.data[0]?.score?.ResidualRatingWorstCase,
        }).getResidualOption();

        return {
          title: rating?.label ?? UNRATED,
          color:
            colours[(rating?.color ?? 'light-grey') as Colour]
              ?.backgroundColor ?? rating?.color,
        };
      },
    },
    {
      id: 'inherentRatingMean',
      name: () => i18n.t('enterpriseRisks.columns.inherentRatingMean'),
      categoryGetter: (item) => ({
        key: item.InherentMeanLabelled ?? UNRATED,
        label: item.InherentMeanLabelled ?? UNRATED,
        sortKey: item.InherentMeanLabelled ?? UNRATED,
      }),
      ratingColourKey: 'risk_uncontrolled',
      clickthroughFilter: defaultClickthroughFilter('InherentMeanLabelled', {
        unratedValue: UNRATED,
      }),
      categoryOverrideFunction: (category, _ratingFns, riskFormatters) => {
        const rating = riskFormatters({
          inherentRating: category.data[0]?.score?.InherentRatingMean,
        }).getInherentOption();

        return {
          title: rating?.label ?? UNRATED,
          color:
            colours[(rating?.color ?? 'light-grey') as Colour]
              ?.backgroundColor ?? rating?.color,
        };
      },
    },
    {
      id: 'inherentRatingWorstCase',
      name: () => i18n.t('enterpriseRisks.columns.inherentRatingWorstCase'),
      categoryGetter: (item) => ({
        key: item.InherentWorstCaseLabelled ?? UNRATED,
        label: item.InherentWorstCaseLabelled ?? UNRATED,
        sortKey: item.InherentWorstCaseLabelled ?? UNRATED,
      }),
      ratingColourKey: 'risk_uncontrolled',
      clickthroughFilter: defaultClickthroughFilter(
        'InherentWorstCaseLabelled',
        {
          unratedValue: UNRATED,
        }
      ),
      categoryOverrideFunction: (category, _ratingFns, riskFormatters) => {
        const rating = riskFormatters({
          inherentRating: category.data[0]?.score?.InherentRatingWorstCase,
        }).getInherentOption();

        return {
          title: rating?.label ?? UNRATED,
          color:
            colours[(rating?.color ?? 'light-grey') as Colour]
              ?.backgroundColor ?? rating?.color,
        };
      },
    },
    {
      id: 'createdDate',
      name: () => i18n.t('columns.created_on'),
      categoryGetter: (data) => new Date(data.CreatedAtTimestamp),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('CreatedAtTimestamp'),
    },
  ],
});
