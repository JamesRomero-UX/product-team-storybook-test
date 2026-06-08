import { Cost_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { HasPermission } from 'src/rbac/Permission';

import { CustomDataSourceWidget } from './custom-data-source-widget/CustomDataSourceWidget';
import type { WidgetDefinition } from './types';
import { UniversalWidget } from './universal-widget/UniversalWidget';
import { ComplianceRatingsOverTime } from './widgets/over-time-widgets/ComplianceRatingsOverTime';
import { ControlTestResultsOverTime } from './widgets/over-time-widgets/ControlTestResultsOverTime';
import { DocumentRatingsOverTime } from './widgets/over-time-widgets/DocumentRatingsOverTime';
import { IndicatorResultsOverTime } from './widgets/over-time-widgets/IndicatorResultsOverTime';
import { OpenIssuesOverTime } from './widgets/over-time-widgets/open-issues/OpenIssuesOverTime';
import { ControlledRiskRatingsOverTime } from './widgets/over-time-widgets/risk-ratings/ControlledRiskRatingsOverTime';
import { UncontrolledRiskRatingsOverTime } from './widgets/over-time-widgets/risk-ratings/UncontrolledRiskRatingsOverTime';
import { RichTextWidget } from './widgets/rich-text-widget/RichTextWidget';
import { ControlledRiskHeatmap } from './widgets/risk-heatmap/ControlledRiskHeatmap';
import { UncontrolledRiskHeatmap } from './widgets/risk-heatmap/UncontrolledRiskHeatmap';
import { riskModelSupportedByHeatmap } from './widgets/utils';
import { createWidget, defaultWidgetOptions } from './widgets/utils';

/**
 * To not access these directly (except in widgets.tsx. This is to avoid circular references)
 */
export const privateWidgets: Record<string, WidgetDefinition> = {
  customDataSourceWidget: createWidget({
    ...defaultWidgetOptions.chart,
    showOnMyItems: false,
    translationKeyPrefix: 'dashboard.widgets.customDataSourceWidget',
    content: CustomDataSourceWidget,
    multiple: true,
    hide(hasPermission: HasPermission, _, isModuleEnabled) {
      const {
        hasPermission: hasCustomDatasourcePermission,
        loading: permissionLoading,
      } = hasPermission('read:custom_datasource');

      return (
        !isModuleEnabled('custom_datasource') ||
        permissionLoading ||
        !hasCustomDatasourcePermission
      );
    },
  }),
  gigawidget: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.gigawidget',
    content: UniversalWidget,
    multiple: true,
  }),
  richText: createWidget({
    ...defaultWidgetOptions.richText,
    translationKeyPrefix: 'dashboard.widgets.richText',
    content: RichTextWidget,
    multiple: true,
    hideTitle: true,
  }),
  openRiskAcceptances: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.openRiskAcceptances',
    settings: {
      dataSource: 'acceptance',
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Open',
          },
        ],
        operation: 'and',
      },
      ignoreDashboardDateFilter: true,
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  indicatorsDeteriorating: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.indicatorsDeteriorating',
    settings: {
      dataSource: 'indicator',
      filtering: {
        tokens: [
          {
            propertyKey: 'ConformanceTrend',
            operator: '=',
            value: 'Deteriorating',
          },
        ],
        operation: 'and',
      },
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  indicatorsImproving: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.indicatorsImproving',
    settings: {
      dataSource: 'indicator',
      filtering: {
        tokens: [
          {
            propertyKey: 'ConformanceTrend',
            operator: '=',
            value: 'Improving',
          },
        ],
        operation: 'and',
      },
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  indicatorsStable: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.indicatorsStable',
    settings: {
      dataSource: 'indicator',
      filtering: {
        tokens: [
          {
            propertyKey: 'ConformanceLabelled',
            operator: '=',
            value: 'Within',
          },
        ],
        operation: 'and',
      },
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  indicatorsOutOfTolerance: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.indicatorsOutOfTolerance',
    settings: {
      dataSource: 'indicator',
      filtering: {
        tokens: [
          {
            propertyKey: 'ConformanceLabelled',
            operator: '=',
            value: 'Outside',
          },
        ],
        operation: 'and',
      },
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  issuesRaisedInPeriod: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.issuesRaisedInPeriod',
    settings: {
      dataSource: 'issue',
      customTitle: true,
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  sumOfFinancialConsequencesByType: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.sumOfFinancialConsequencesByType',
    settings: {
      dataSource: 'consequence',
      chartType: 'pie',
      filtering: {
        tokens: [
          {
            propertyKey: 'CostTypeLabelled',
            operator: ':',
            value: `${Cost_Type_Enum.Financial}`,
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'type',
      aggregationType: 'sum',
      aggregationField: 'CostValue',
      customTitle: true,
    },
    hide(_, __, isModuleEnabled) {
      return !isModuleEnabled('issue.subModules.consequence');
    },
  }),
  sumOfHoursConsequencesByType: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.sumOfHoursConsequencesByType',
    settings: {
      dataSource: 'consequence',
      chartType: 'pie',
      filtering: {
        tokens: [
          {
            propertyKey: 'CostTypeLabelled',
            operator: '=',
            value: 'Hours',
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'type',
      aggregationType: 'sum',
      aggregationField: 'CostValue',
      customTitle: true,
    },
    hide(_, __, isModuleEnabled) {
      return !isModuleEnabled('issue.subModules.consequence');
    },
  }),
  sumOfCustomersConsequencesByType: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.sumOfCustomersConsequencesByType',
    settings: {
      dataSource: 'consequence',
      chartType: 'pie',
      filtering: {
        tokens: [
          {
            propertyKey: 'CostTypeLabelled',
            operator: '=',
            value: 'Customers impacted',
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'type',
      aggregationType: 'sum',
      aggregationField: 'CostValue',
      customTitle: true,
    },
    hide(_, __, isModuleEnabled) {
      return !isModuleEnabled('issue.subModules.consequence');
    },
  }),
  sumOfNumberConsequencesByType: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.sumOfNumberConsequencesByType',
    settings: {
      dataSource: 'consequence',
      chartType: 'pie',
      filtering: {
        tokens: [
          {
            propertyKey: 'CostTypeLabelled',
            operator: '=',
            value: 'Number',
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'type',
      aggregationType: 'sum',
      aggregationField: 'CostValue',
      customTitle: true,
    },
    hide(_, __, isModuleEnabled) {
      return !isModuleEnabled('issue.subModules.consequence');
    },
  }),
  actionsByStatus: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.actionsByStatus',
    settings: {
      dataSource: 'action',
      chartType: 'donut',
      categoryGetter: 'status',
      customTitle: true,
    },
  }),
  risksByUncontrolledRiskRating: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.risksByUncontrolledRiskRating',
    settings: {
      dataSource: 'risk',
      chartType: 'donut',
      categoryGetter: 'uncontrolledRating',
      customTitle: true,
    },
  }),
  risksByControlledRiskRating: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.risksByControlledRiskRating',
    settings: {
      dataSource: 'risk',
      chartType: 'donut',
      categoryGetter: 'controlledRating',
      customTitle: true,
    },
  }),
  controlEffectivenessByDepartment: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlEffectivenessByDepartment',
    settings: {
      dataSource: 'control',
      chartType: 'stacked-bar',
      categoryGetter: 'departments',
      subCategoryGetter: 'effectiveness',
      customTitle: true,
    },
  }),
  controlledRiskRatingByDepartment: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlledRiskRatingByDepartment',
    settings: {
      dataSource: 'risk',
      chartType: 'stacked-bar',
      categoryGetter: 'departments',
      subCategoryGetter: 'controlledRating',
      customTitle: true,
    },
  }),
  uncontrolledRiskRatingByDepartment: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix:
      'dashboard.widgets.uncontrolledRiskRatingByDepartment',
    settings: {
      dataSource: 'risk',
      chartType: 'stacked-bar',
      categoryGetter: 'departments',
      subCategoryGetter: 'uncontrolledRating',
      customTitle: true,
    },
  }),
  issueRaisedSeverityByMonth: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.issueRaisedSeverityByMonth',
    settings: {
      dataSource: 'issue',
      chartType: 'stacked-bar',
      categoryGetter: 'createdDate',
      precision: 'month',
      subCategoryGetter: 'severity',
      customTitle: true,
    },
  }),
  documentReviewsDueByMonth: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.documentReviewsDueByMonth',
    settings: {
      dataSource: 'document',
      chartType: 'bar',
      categoryGetter: 'nextReviewDue',
      precision: 'month',
      customTitle: true,
    },
  }),
  issuesTable: createWidget({
    ...defaultWidgetOptions.table,
    translationKeyPrefix: 'dashboard.widgets.issuesTable',
    settings: {
      dataSource: 'issue',
      chartType: 'table',
    },
  }),
  overdueActions: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.overdueActions',
    settings: {
      dataSource: 'action',
      customTitle: true,
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Overdue',
          },
        ],
        operation: 'and',
      },
      ignoreDashboardDateFilter: true,
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  openIssuesOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.openIssuesOverTime',
    content: OpenIssuesOverTime,
  }),
  oldestOpenIssue: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.oldestOpenIssue',
    settings: {
      dataSource: 'issue',
      customTitle: true,
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Open',
          },
        ],
        operation: 'and',
      },
      sorting: {
        sortingColumn: {
          sortingField: 'CreatedAtTimestamp',
        },
        isDescending: false,
      },
      ignoreDashboardDateFilter: true,
      chartType: 'kpi',
      aggregationType: 'max',
      aggregationField: 'TimeSinceCreated',
      customUnit: true,
      unit: 'Days',
    },
  }),
  averageTimeToResolve: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.averageTimeToResolve',
    settings: {
      dataSource: 'issue',
      customTitle: true,
      chartType: 'kpi',
      aggregationType: 'mean',
      aggregationField: 'TimeToResolve',
      customUnit: true,
      unit: 'Days',
    },
  }),
  openIssues: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.openIssues',
    settings: {
      dataSource: 'issue',
      customTitle: true,
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Open',
          },
        ],
        operation: 'and',
      },
      ignoreDashboardDateFilter: true,
      chartType: 'kpi',
      aggregationType: 'count',
    },
  }),
  issueCauses: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.issueCauses',
    settings: {
      dataSource: 'cause',
      chartType: 'donut',
      categoryGetter: 'Title',
      customTitle: true,
    },
    hide(_, __, isModuleEnabled) {
      return !isModuleEnabled('issue.subModules.cause');
    },
  }),
  issueByRaisedMonth: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.issueByRaisedMonth',
    settings: {
      dataSource: 'issue',
      chartType: 'bar',
      categoryGetter: 'createdDate',
      precision: 'month',
      customTitle: true,
    },
  }),
  openIssuesByType: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.openIssuesByType',
    settings: {
      dataSource: 'issue',
      chartType: 'donut',
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Open',
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'type',
      customTitle: true,
    },
  }),
  openActionsByPriority: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.openActionsByPriority',
    settings: {
      dataSource: 'action',
      chartType: 'donut',
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Open',
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'priority',
      customTitle: true,
    },
  }),
  controlEffectiveness: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlEffectiveness',
    settings: {
      dataSource: 'control',
      chartType: 'donut',
      categoryGetter: 'effectiveness',
      customTitle: true,
    },
  }),
  openIssueSeverity: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.openIssueSeverity',
    settings: {
      dataSource: 'issue',
      chartType: 'donut',
      filtering: {
        tokens: [
          {
            propertyKey: 'StatusLabelled',
            operator: '=',
            value: 'Open',
          },
        ],
        operation: 'and',
      },
      categoryGetter: 'severity',
      customTitle: true,
    },
  }),
  controlledRiskHeatMap: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlledRiskHeatMap',
    content: ControlledRiskHeatmap,
    hide(_, riskModel, isModuleEnabled) {
      return (
        isModuleEnabled('risk.subModules.impact') ||
        !riskModelSupportedByHeatmap(riskModel)
      );
    },
  }),
  uncontrolledRiskHeatMap: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.uncontrolledRiskHeatMap',
    content: UncontrolledRiskHeatmap,
    hide(_, riskModel, isModuleEnabled) {
      return (
        isModuleEnabled('risk.subModules.impact') ||
        !riskModelSupportedByHeatmap(riskModel)
      );
    },
  }),
  averageTimeToIdentify: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.averageTimeToIdentify',
    settings: {
      dataSource: 'issue',
      customTitle: true,
      chartType: 'kpi',
      aggregationType: 'mean',
      aggregationField: 'TimeToIdentify',
      customUnit: true,
      unit: 'Days',
    },
  }),
  averageTimeToReport: createWidget({
    ...defaultWidgetOptions.statistic,
    translationKeyPrefix: 'dashboard.widgets.averageTimeToReport',
    settings: {
      dataSource: 'issue',
      customTitle: true,
      chartType: 'kpi',
      aggregationType: 'mean',
      aggregationField: 'TimeToReport',
      customUnit: true,
      unit: 'Days',
    },
  }),
  controlTestsDueByMonth: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlTestsDueByMonth',
    settings: {
      dataSource: 'control',
      chartType: 'bar',
      categoryGetter: 'nextTestDate',
      precision: 'month',
      customTitle: true,
    },
  }),
  ControlledRiskRatingsOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlledRiskRatingsOverTime',
    content: ControlledRiskRatingsOverTime,
    settings: {
      ignoreDashboardDateFilter: true,
    },
    hide(_, riskModel, isModuleEnabled) {
      return (
        isModuleEnabled('risk.subModules.impact') ||
        !riskModelSupportedByHeatmap(riskModel)
      );
    },
  }),
  UncontrolledRiskRatingsOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.uncontrolledRiskRatingsOverTime',
    content: UncontrolledRiskRatingsOverTime,
    settings: {
      ignoreDashboardDateFilter: true,
    },
    hide(_, riskModel, isModuleEnabled) {
      return (
        isModuleEnabled('risk.subModules.impact') ||
        !riskModelSupportedByHeatmap(riskModel)
      );
    },
  }),
  ControlTestResultsOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.controlTestResultsOverTime',
    content: ControlTestResultsOverTime,
    settings: {
      ignoreDashboardDateFilter: true,
    },
  }),
  IndicatorResultsOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.indicatorResultsOverTime',
    content: IndicatorResultsOverTime,
    settings: {
      ignoreDashboardDateFilter: true,
    },
  }),
  DocumentRatingsOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.documentRatingsOverTime',
    content: DocumentRatingsOverTime,
    settings: {
      dataSource: 'document',
      ignoreDashboardDateFilter: true,
    },
  }),
  ComplianceRatingsOverTime: createWidget({
    ...defaultWidgetOptions.chart,
    translationKeyPrefix: 'dashboard.widgets.complianceRatingsOverTime',
    content: ComplianceRatingsOverTime,
    settings: {
      ignoreDashboardDateFilter: true,
    },
  }),
};
