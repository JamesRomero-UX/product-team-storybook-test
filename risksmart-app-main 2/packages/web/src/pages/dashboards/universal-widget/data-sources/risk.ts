import { useQuery } from '@apollo/client';
import type { Colour } from '@risksmart-app/components/src/utils/colours';
import { colours } from '@risksmart-app/components/src/utils/colours';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { RiskRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Risk_Assessment_Result_Bool_Exp,
  Risk_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAppetitesGroupedByImpactDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRisksFlatDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { mapTrpcRisksToGraphQL } from 'src/hooks/queries/risk/useGetRiskRegister';
import type { RiskRegisterFields } from 'src/pages/risks/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { useRiskScores } from '@/hooks/useRiskScore';
import { riskRegisterUrl } from '@/utils/urls';

import { useGetRiskSmartWidgetTableProps } from '../../../risks/config';
import { UNRATED } from '../../gigawidget/types';
import {
  dateRangeFilter,
  departmentsFilter,
  tagsFilter,
} from '../../gigawidget/util/filterHelpers';
import { getQueryVariables } from '../../my-items/hooks/useGetQueryVariables';
import { createDataSource } from '../createDataSource';
import {
  dashboardDateRangeClickthroughFilter,
  dateRangeClickthroughFilter,
  defaultClickthroughFilter,
  tagAndDepartmentCategoryGetters,
} from '../dataSourceHelpers';

export default createDataSource({
  hasAccess: () => true,
  parentTypes: [
    Parent_Type_Enum.Risk,
    Parent_Type_Enum.RiskControlledAssessment,
    Parent_Type_Enum.RiskUncontrolledAssessment,
  ],
  documentNode: GetRisksFlatDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.risk.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: RiskRegisterResponse) => {
        return mapTrpcRisksToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () =>
    ({
      where: useEntityWhereFilter<Risk_Bool_Exp>(Parent_Type_Enum.Risk),
      riskAssessmentResultsWhere: {},
    }) as {
      where: Risk_Bool_Exp;
      riskAssessmentResultsWhere: Risk_Assessment_Result_Bool_Exp;
    },
  useTablePropsHook: (data, options) => {
    const { scores } = useRiskScores();

    const { data: impactAppetites } = useQuery(
      GetAppetitesGroupedByImpactDocument
    );

    return useGetRiskSmartWidgetTableProps(
      data?.risk,
      scores,
      impactAppetites?.impact,
      options
    );
  },
  entityNamePlural: 'risk_other',
  entityNameSingular: 'risk_one',
  fields: 'risks.fields',
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({ where: { tags: tagsFilter(tags) } }),
    departmentsFilter: (departments) => ({
      where: { departments: departmentsFilter(departments) },
    }),
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: getQueryVariables(myItemsFilters, userId).riskFilterConditions,
    }),
  },
  clickThroughUrl: (filter) => riskRegisterUrl(filter),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<RiskRegisterFields>(),
    {
      id: 'tier',
      name: () => i18n.t('risks.columns.risk_tier'),
      categoryGetter: (item) => item.TierLabelled,
      clickthroughFilter: defaultClickthroughFilter('TierLabelled'),
    },
    {
      id: 'status',
      name: () => i18n.t('risks.columns.risk_status'),
      categoryGetter: (item) => item.StatusLabelled ?? UNRATED,
      clickthroughFilter: defaultClickthroughFilter('StatusLabelled', {
        unratedValue: '',
      }),
    },
    {
      id: 'treatment',
      name: () => i18n.t('risks.columns.risk_treatment'),
      categoryGetter: (item) => item.TreatmentLabelled ?? UNRATED,
      clickthroughFilter: defaultClickthroughFilter('TreatmentLabelled'),
    },
    {
      id: 'owner',
      name: () => i18n.t('risks.columns.risk_owner'),
      categoryGetter: (item) =>
        item.allOwners.map((owner) => ({ key: owner.id, label: owner.label })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'allOwners',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'contributor',
      name: () => i18n.t(`risks.columns.risk_contributor`),
      categoryGetter: (item) =>
        item.allContributors.map((contributor) => ({
          key: contributor.id,
          label: contributor.label,
        })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'allContributors',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'entity',
      name: () => i18n.t('risks.columns.entity'),
      categoryGetter: (item) => item.Entity ?? UNRATED,
      clickthroughFilter: defaultClickthroughFilter('Entity'),
    },
    {
      id: 'enterpriseRisk',
      name: () => i18n.t('risks.columns.enterprise_risk'),
      categoryGetter: (item) => item.EnterpriseRiskLabelled ?? UNRATED,
      clickthroughFilter: defaultClickthroughFilter('EnterpriseRiskLabelled'),
    },
    {
      id: 'controlledRating',
      name: () => i18n.t('risks.columns.controlled_rating'),
      categoryGetter: (item) => ({
        key: item.ControlledRatingLabelled ?? UNRATED,
        label: item.ControlledRatingLabelled ?? UNRATED,
        sortKey: item.ControlledRating?.toString(),
      }),
      ratingColourKey: 'risk_controlled',
      clickthroughFilter: defaultClickthroughFilter(
        'ControlledRatingLabelled',
        {
          unratedValue: UNRATED,
        }
      ),
      categoryOverrideFunction: (category, ratingFns, riskFormatters) => {
        const rating = riskFormatters({
          residualRating: category.data[0]?.ControlledRating,
          residualLikelihood: category.data[0]?.ControlledLikelihoodValue,
          residualImpact: category.data[0]?.ControlledImpactValue,
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
      id: 'uncontrolledRating',
      name: () => i18n.t('risks.columns.uncontrolled_rating'),
      categoryGetter: (item) => ({
        key: item.UncontrolledRatingLabelled ?? UNRATED,
        label: item.UncontrolledRatingLabelled ?? UNRATED,
        sortKey: item.UncontrolledRating?.toString(),
      }),
      ratingColourKey: 'risk_uncontrolled',
      clickthroughFilter: defaultClickthroughFilter(
        'UncontrolledRatingLabelled',
        {
          unratedValue: UNRATED,
        }
      ),
      categoryOverrideFunction: (category, ratingFns, riskFormatters) => {
        const rating = riskFormatters({
          inherentRating: category.data[0]?.UncontrolledRating,
          inherentLikelihood: category.data[0]?.UncontrolledLikelihoodValue,
          inherentImpact: category.data[0]?.UncontrolledImpactValue,
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
      id: 'appetitePerformance',
      name: () => i18n.t('risks.columns.appetite_performance'),
      categoryGetter: (item) => ({
        key: item.AppetitePerformance ?? UNRATED,
        label: item.AppetitePerformanceLabelled ?? UNRATED,
        sortKey: item.AppetitePerformance?.toString(),
      }),
      ratingColourKey: 'appetite_performance',
      clickthroughFilter: defaultClickthroughFilter(
        'AppetitePerformanceLabelled',
        {
          unratedValue: UNRATED,
        }
      ),
      categoryOverrideFunction: (category, ratingFns, _) => {
        const rating = ratingFns.getByValue(
          category.data[0]?.AppetitePerformance
        );

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
    {
      id: 'nextTestDate',
      name: () => i18n.t('risks.columns.next_test_date'),
      categoryGetter: (data) => {
        const d = dayjs(data.NextTestDate);

        return d.isValid() ? d.toDate() : null;
      },
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          scheduleState: { DueDate: dateRangeFilter(dateRange, precision) },
        },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('NextTestDate'),
    },
    {
      id: 'nextTestOverdueDate',
      name: () => i18n.t('risks.columns.nextTestOverdue'),
      categoryGetter: (data) => {
        const d = dayjs(data.NextTestOverdueDate);

        return d.isValid() ? d.toDate() : null;
      },
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          scheduleState: { OverdueDate: dateRangeFilter(dateRange, precision) },
        },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('NextTestOverdueDate'),
    },
    {
      id: 'testScheduleStatus',
      name: () => i18n.t('risks.columns.testScheduleStatus'),
      categoryGetter: (item) => {
        return item.TestScheduleStatus === '-'
          ? { key: '-', label: i18n.t('columns.unscheduled') }
          : item.TestScheduleStatusLabelled;
      },
      clickthroughFilter: (category) => [
        {
          propertyKey: 'TestScheduleStatusLabelled',
          operator: '=',
          value: category.key === '-' ? '-' : category.key,
        },
      ],
    },
    {
      id: 'uncontrolledRatingTrend',
      name: () => i18n.t('risks.columns.uncontrolled_rating_trend'),
      categoryGetter: (item) => ({
        key: item.UncontrolledRatingTrend ?? UNRATED,
        label: item.UncontrolledRatingTrendLabelled ?? UNRATED,
      }),
      ratingColourKey: 'rating_trend',
      isHiddenWhenAggregationsEnabled: true,
      clickthroughFilter: defaultClickthroughFilter(
        'UncontrolledRatingTrendLabelled',
        { unratedValue: UNRATED }
      ),
    },
    {
      id: 'controlledRatingTrend',
      name: () => i18n.t('risks.columns.controlled_rating_trend'),
      categoryGetter: (item) => ({
        key: item.ControlledRatingTrend ?? UNRATED,
        label: item.ControlledRatingTrendLabelled ?? UNRATED,
      }),
      ratingColourKey: 'rating_trend',
      isHiddenWhenAggregationsEnabled: true,
      clickthroughFilter: defaultClickthroughFilter(
        'ControlledRatingTrendLabelled',
        { unratedValue: UNRATED }
      ),
    },
  ],
});
