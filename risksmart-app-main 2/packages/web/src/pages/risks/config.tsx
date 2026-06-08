import Badge from '@risk-smart/themed-cloudscape-components/badge';
import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  type GetAppetitesGroupedByImpactQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import IndicatorsPopover from 'src/components/indicators-popover';
import ResponsiveRatingBadges from 'src/components/responsive-rating-badges';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useAggregation } from 'src/hooks/useAggregation';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import type { RiskScore } from '@/hooks/useRiskScore';
import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import { toLocalDate } from '@/utils/dateUtils';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import {
  exportStyleFromLatestHistory,
  exportStyleFromOption,
  exportStyleFromValue,
} from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { addRiskUrl, riskDetailsUrl } from '@/utils/urls';

import { getPerformanceRatingFromPerformanceScore } from '../impacts/ratings/performanceCalculation';
import { RiskScoreBadge } from './RiskScoreBadge';
import styles from './style.module.scss';
import type { RiskFields, RiskRegisterFields } from './types';
import { useGetLabelledFields } from './useGetLabelledFields';
import { useRatingCustomAttributeFields } from './useRatingCustomAttributeFields';

// ---- PDF export cell style helpers (shared)

export const useGetFieldConfig = (
  onEditRating?: (ratingId: string) => void
): TableFields<RiskRegisterFields> => {
  const { riskModel } = useAggregation();
  const isEnterpriseRiskEnabled = useIsModuleEnabled('enterprise_risk');
  const ownersField = useGetOwnersFieldConfig<RiskRegisterFields>({
    formId: 'risk',
    fieldId: 'Owners',
  });
  const contributorsField = useGetContributorsFieldConfig<RiskRegisterFields>({
    formId: 'risk',
    fieldId: 'Contributors',
  });
  const tagField = useGetTagFieldConfig<RiskRegisterFields>({
    formId: 'risk',
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<RiskRegisterFields>(
    (r) => r.departments,
    {
      formId: 'risk',
      fieldId: 'departments',
    }
  );
  const posture = useIsFeatureFlagEnabled('posture');
  const riskScoreFormatters = useRiskScoreFormatters();
  const {
    resolveImpact,
    resolveLikelihood,
    resolveRiskRating,
    maxInherentRating,
    maxResidualRating,
  } = useRiskRatingResolver();
  const { getByValue: getAppetiteByValue } = useRating('risk_appetite');
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], { keyPrefix: 'risks.columns' });
  const { t: at } = useTranslation(['common'], {
    keyPrefix: 'appetites.columns',
  });
  const { getByValue: getAppetitePerformanceByValue } = useRating(
    'appetite_performance'
  );
  const { getByValue: getImpactPerformanceByValue } =
    useRating('impact_performance');
  const { getByValue: getRatingTrendByValue } = useRating('rating_trend');
  const { getByValue: getByValueTestScheduleStatus } = useRating(
    'test_schedule_status'
  );
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const { getByValue: getInherentByValue } = useRating('risk_uncontrolled');
  const { getByValue: getResidualByValue } = useRating('risk_controlled');

  return useMemo(() => {
    return {
      SequentialIdLabel: { header: t('id'), sortingField: 'SequentialId' },
      Title: {
        formId: 'risk',
        fieldId: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={riskDetailsUrl(item.Id)}>
            {item.Title}
          </Link>
        ),
        isRowHeader: true,
      },
      ParentTitle: {
        formId: 'risk',
        fieldId: 'ParentRiskId',
        cell: (item) => item.ParentTitle || 'None',
      },
      TierLabelled: {
        formId: 'risk',
        fieldId: 'Tier',
      },
      TreatmentLabelled: {
        formId: 'risk',
        fieldId: 'Treatment',
      },
      StatusLabelled: {
        formId: 'risk',
        fieldId: 'Status',
      },
      allOwners: ownersField,
      allContributors: contributorsField,
      // Trend columns only shown when using default risk scoring model
      ...(riskModel !== 'default'
        ? {}
        : {
            UncontrolledRatingTrendLabelled: {
              header: st('uncontrolled_rating_trend'),
              sortingField: 'UncontrolledRatingTrendLabelled',
              cell: (item) => (
                <SimpleRatingBadge
                  rating={getRatingTrendByValue(item.UncontrolledRatingTrend)}
                >
                  {item.UncontrolledRatingTrendLabelled}
                </SimpleRatingBadge>
              ),
              exportCellStyle: exportStyleFromValue(
                (item) => item.UncontrolledRatingTrend,
                (v) => getRatingTrendByValue(v)
              ),
            },
            ControlledRatingTrendLabelled: {
              header: st('controlled_rating_trend'),
              sortingField: 'ControlledRatingTrendLabelled',
              cell: (item) => (
                <SimpleRatingBadge
                  rating={getRatingTrendByValue(item.ControlledRatingTrend)}
                >
                  {item.ControlledRatingTrendLabelled}
                </SimpleRatingBadge>
              ),
              exportCellStyle: exportStyleFromValue(
                (item) => item.ControlledRatingTrend,
                (v) => getRatingTrendByValue(v)
              ),
            },
          }),
      ...(impactsEnabled || riskModel !== 'default'
        ? {}
        : {
            UncontrolledRatingHistory: {
              header: st('uncontrolled_rating_history'),
              filterOptions: {
                filteringProperties: {
                  operators: [],
                },
              },
              cell: (item) => {
                return (
                  <ResponsiveRatingBadges
                    maxRating={maxInherentRating}
                    invertRating={true}
                    ratings={item.UncontrolledRatingHistory?.filter(
                      (c) => c?.rating !== undefined
                    ).map((c) => {
                      const resolved = resolveRiskRating({
                        likelihood: c.likelihood,
                        impact: c.impact,
                        controlType:
                          Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
                        rating: c.rating,
                      });

                      return {
                        label: resolved?.label ?? '-',
                        color: resolved?.color,
                        id: c.id,
                        rating: c.rating,
                        testDate: c.testDate,
                        onClick: onEditRating
                          ? () => onEditRating(c.id)
                          : undefined,
                      };
                    })}
                  />
                );
              },
              minWidth: 160,
              // Use the most recent history item's rating colour for PDF cell background/text
              exportCellStyle: exportStyleFromLatestHistory(
                (item) => item.UncontrolledRatingHistory,
                (rating) => getInherentByValue(rating)
              ),
              exportVal: (item) =>
                item.UncontrolledRatingHistory?.map((c) => {
                  const resolved = resolveRiskRating({
                    likelihood: c.likelihood,
                    impact: c.impact,
                    controlType:
                      Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
                    rating: c.rating,
                  });

                  return `${toLocalDate(c.testDate)} ${resolved?.label ?? '-'}`;
                }).join(',') ?? '',
            },
            ControlledRatingHistory: {
              header: st('controlled_rating_history'),
              filterOptions: {
                filteringProperties: {
                  operators: [],
                },
              },
              cell: (item) => {
                return (
                  <ResponsiveRatingBadges
                    maxRating={maxResidualRating}
                    invertRating={true}
                    ratings={item.ControlledRatingHistory?.filter(
                      (c) => c?.rating !== undefined
                    ).map((c) => {
                      const resolved = resolveRiskRating({
                        likelihood: c.likelihood,
                        impact: c.impact,
                        controlType:
                          Risk_Assessment_Result_Control_Type_Enum.Controlled,
                        rating: c.rating,
                      });

                      return {
                        label: resolved?.label ?? '-',
                        color: resolved?.color,
                        id: c.id,
                        rating: c.rating,
                        testDate: c.testDate,
                        onClick: onEditRating
                          ? () => onEditRating(c.id)
                          : undefined,
                      };
                    })}
                  />
                );
              },
              minWidth: 160,
              exportCellStyle: exportStyleFromLatestHistory(
                (item) => item.ControlledRatingHistory,
                (rating) => getResidualByValue(rating)
              ),
              exportVal: (item) =>
                item.ControlledRatingHistory?.map((c) => {
                  const resolved = resolveRiskRating({
                    likelihood: c.likelihood,
                    impact: c.impact,
                    controlType:
                      Risk_Assessment_Result_Control_Type_Enum.Controlled,
                    rating: c.rating,
                  });

                  return `${toLocalDate(c.testDate)} ${resolved?.label ?? '-'}`;
                }).join(',') ?? '',
            },
          }),

      ...(impactsEnabled
        ? {}
        : {
            UncontrolledRatingLabelled: {
              header: st('uncontrolled_rating'),
              cell: (item) => {
                return riskScoreFormatters({
                  inherentRating: item.UncontrolledRating,
                  inherentLikelihood: item.UncontrolledLikelihoodValue,
                  inherentImpact: item.UncontrolledImpactValue,
                }).getInherentRatingBadge();
              },
              sortingField: 'UncontrolledRating',
              // Provide PDF export cell styling (badge background + accessible text)
              exportCellStyle: exportStyleFromOption((item) =>
                riskScoreFormatters({
                  inherentRating: item.UncontrolledRating,
                  inherentLikelihood: item.UncontrolledLikelihoodValue,
                  inherentImpact: item.UncontrolledImpactValue,
                }).getInherentOption()
              ),
              // Ensure PDF/CSV export uses the label (or 'Unrated') instead of a blank value
              exportVal: (item) =>
                riskScoreFormatters({
                  inherentRating: item.UncontrolledRating,
                  inherentLikelihood: item.UncontrolledLikelihoodValue,
                  inherentImpact: item.UncontrolledImpactValue,
                }).getInherentLabel(),
            },
            ControlledRatingLabelled: {
              header: st('controlled_rating'),
              cell: (item) => {
                return riskScoreFormatters({
                  residualRating: item.ControlledRating,
                  residualLikelihood: item.ControlledLikelihoodValue,
                  residualImpact: item.ControlledImpactValue,
                }).getResidualRatingBadge();
              },
              sortingField: 'ControlledRating',
              // Provide PDF export cell styling (badge background + accessible text)
              exportCellStyle: exportStyleFromOption((item) =>
                riskScoreFormatters({
                  residualRating: item.ControlledRating,
                  residualLikelihood: item.ControlledLikelihoodValue,
                  residualImpact: item.ControlledImpactValue,
                }).getResidualOption()
              ),
              // Ensure PDF/CSV export uses the label (or 'Unrated') instead of a blank value
              exportVal: (item) =>
                riskScoreFormatters({
                  residualRating: item.ControlledRating,
                  residualLikelihood: item.ControlledLikelihoodValue,
                  residualImpact: item.ControlledImpactValue,
                }).getResidualLabel(),
            },
            UncontrolledScore: {
              header: st('uncontrolled_score'),
              cell: (item) => (
                <RiskScoreBadge
                  controlType={
                    Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
                  }
                  riskScoreModel={riskModel}
                  impact={item.UncontrolledImpactValue}
                  likelihood={item.UncontrolledLikelihoodValue}
                  score={item.UncontrolledScore}
                  rating={item.UncontrolledRating}
                />
              ),

              filterOptions: {
                filteringProperties: {
                  operators: ['!=', '>', '<', '>=', '<=', '='],
                },
              },
              // PDF export: colour cell based on the uncontrolled rating colour
              exportCellStyle: exportStyleFromOption((item) =>
                riskScoreFormatters({
                  inherentRating: item.UncontrolledRating,
                  inherentLikelihood: item.UncontrolledLikelihoodValue,
                  inherentImpact: item.UncontrolledImpactValue,
                }).getInherentOption()
              ),
              // Export numeric score to 1dp, or 'Unrated' when not set
              exportVal: (item) =>
                item.UncontrolledScore === null ||
                item.UncontrolledScore === undefined
                  ? 'Unrated'
                  : item.UncontrolledScore.toFixed(1),
            },
            ControlledScore: {
              header: st('controlled_score'),
              cell: (item) => (
                <RiskScoreBadge
                  controlType={
                    Risk_Assessment_Result_Control_Type_Enum.Controlled
                  }
                  riskScoreModel={riskModel}
                  impact={item.ControlledImpactValue}
                  likelihood={item.ControlledLikelihoodValue}
                  score={item.ControlledScore}
                  rating={item.ControlledRating}
                />
              ),
              filterOptions: {
                filteringProperties: {
                  operators: ['!=', '>', '<', '>=', '<=', '='],
                },
              },
              // PDF export: colour cell based on the controlled rating colour
              exportCellStyle: exportStyleFromOption((item) =>
                riskScoreFormatters({
                  residualRating: item.ControlledRating,
                  residualLikelihood: item.ControlledLikelihoodValue,
                  residualImpact: item.ControlledImpactValue,
                }).getResidualOption()
              ),
              // Export numeric score to 1dp, or 'Unrated' when not set
              exportVal: (item) =>
                item.ControlledScore === null ||
                item.ControlledScore === undefined
                  ? 'Unrated'
                  : item.ControlledScore.toFixed(1),
            },
          }),

      LinkedControlCount: {
        header: st('linked_controls'),
      },
      LinkedActionCount: {
        header: st('linked_actions'),
      },
      ...(impactsEnabled
        ? {
            ImpactPerformanceScore: {
              header: st('impact_performance'),
              cell: (item) => {
                if (item.impactRatings.length === 0) {
                  return '-';
                }
                const impactPerformanceRating = getImpactPerformanceByValue(
                  getPerformanceRatingFromPerformanceScore(
                    item.ImpactPerformanceScore
                  )
                );

                return (
                  <SimpleRatingBadge
                    rating={{
                      ...impactPerformanceRating,
                      label: item.ImpactPerformanceScore?.toString() ?? '-',
                      tooltip: impactPerformanceRating?.label,
                    }}
                  />
                );
              },
              exportCellStyle: exportStyleFromValue(
                (item) =>
                  getPerformanceRatingFromPerformanceScore(
                    item.ImpactPerformanceScore
                  ),
                (rating) => getImpactPerformanceByValue(rating)
              ),
            },
          }
        : {
            ControlledLikelihood: {
              header: st('controlled_likelihood'),
              cell: (item) => (
                <SimpleRatingBadge
                  rating={resolveLikelihood(item.ControlledLikelihoodValue)}
                />
              ),
              sortingField: 'ControlledLikelihoodValue',
              // PDF export: colour cell based on the likelihood rating colour
              exportCellStyle: exportStyleFromValue(
                (item) => item.ControlledLikelihoodValue,
                (v) => resolveLikelihood(v)
              ),
            },
            ControlledLikelihoodValue: {
              header: st('controlled_likelihood_score'),
              cell: (item) =>
                item.ControlledLikelihoodValue ? (
                  <SimpleRatingBadge
                    rating={{
                      ...resolveLikelihood(item.ControlledLikelihoodValue),
                      label: item.ControlledLikelihoodValue.toFixed(1),
                    }}
                  />
                ) : (
                  '-'
                ),
              // PDF export: colour cell based on the likelihood rating colour
              exportCellStyle: exportStyleFromValue(
                (item) => item.ControlledLikelihoodValue,
                (v) => resolveLikelihood(v)
              ),
            },
            ControlledImpact: {
              header: st('controlled_impact'),
              cell: (item) => (
                <SimpleRatingBadge
                  rating={resolveImpact(item.ControlledImpactValue)}
                />
              ),
              sortingField: 'ControlledImpactValue',
              exportCellStyle: exportStyleFromValue(
                (item) => item.ControlledImpactValue,
                (v) => resolveImpact(v)
              ),
            },
            ControlledImpactValue: {
              header: st('controlled_impact_score'),
              cell: (item) =>
                item.ControlledImpactValue ? (
                  <SimpleRatingBadge
                    rating={{
                      ...resolveImpact(item.ControlledImpactValue),
                      label: item.ControlledImpactValue.toFixed(1),
                    }}
                  />
                ) : (
                  '-'
                ),
              exportCellStyle: exportStyleFromValue(
                (item) => item.ControlledImpactValue,
                (v) => resolveImpact(v)
              ),
            },
            UncontrolledImpact: {
              header: st('uncontrolled_impact'),
              cell: (item) => (
                <SimpleRatingBadge
                  rating={resolveImpact(item.UncontrolledImpactValue)}
                />
              ),
              sortingField: 'UncontrolledImpactValue',
              exportCellStyle: exportStyleFromValue(
                (item) => item.UncontrolledImpactValue,
                (v) => resolveImpact(v)
              ),
            },
            UncontrolledImpactValue: {
              header: st('uncontrolled_impact_score'),
              cell: (item) =>
                item.UncontrolledImpactValue ? (
                  <SimpleRatingBadge
                    rating={{
                      ...resolveImpact(item.UncontrolledImpactValue),
                      label: item.UncontrolledImpactValue.toFixed(1),
                    }}
                  />
                ) : (
                  '-'
                ),
              exportCellStyle: exportStyleFromValue(
                (item) => item.UncontrolledImpactValue,
                (v) => resolveImpact(v)
              ),
            },
            UncontrolledLikelihood: {
              header: st('uncontrolled_likelihood'),
              cell: (item) => (
                <SimpleRatingBadge
                  rating={resolveLikelihood(item.UncontrolledLikelihoodValue)}
                />
              ),
              sortingField: 'UncontrolledLikelihoodValue',
              exportCellStyle: exportStyleFromValue(
                (item) => item.UncontrolledLikelihoodValue,
                (v) => resolveLikelihood(v)
              ),
            },
            UncontrolledLikelihoodValue: {
              header: st('uncontrolled_likelihood_score'),
              cell: (item) =>
                item.UncontrolledLikelihoodValue ? (
                  <SimpleRatingBadge
                    rating={{
                      ...resolveLikelihood(item.UncontrolledLikelihoodValue),
                      label: item.UncontrolledLikelihoodValue.toFixed(1),
                    }}
                  />
                ) : (
                  '-'
                ),
              exportCellStyle: exportStyleFromValue(
                (item) => item.UncontrolledLikelihoodValue,
                (v) => resolveLikelihood(v)
              ),
            },
          }),

      ...(!posture
        ? {
            LowerAppetiteLabelled: {
              header: st('lower_appetite'),
              cell: (item) => (
                <SimpleRatingBadge
                  rating={getAppetiteByValue(
                    item.appetites?.[0]?.appetite?.LowerAppetite
                  )}
                />
              ),
              exportCellStyle: exportStyleFromOption((item) =>
                getAppetiteByValue(item.appetites?.[0]?.appetite?.LowerAppetite)
              ),
            },
          }
        : {}),
      UpperAppetiteLabelled: {
        header: posture ? at('posture') : st('upper_appetite'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={getAppetiteByValue(
              item.appetites?.[0]?.appetite?.UpperAppetite
            )}
          />
        ),
        exportCellStyle: exportStyleFromOption((item) =>
          getAppetiteByValue(item.appetites?.[0]?.appetite?.UpperAppetite)
        ),
      },
      ...(impactsEnabled
        ? {}
        : {
            AppetitePerformanceLabelled: {
              header: st('appetite_performance'),
              cell: (item) => {
                if (!item.AppetitePerformance) {
                  return '-';
                }

                const performanceItem = getAppetitePerformanceByValue(
                  item.AppetitePerformance
                ) ?? {
                  label: 'Undefined',
                  color: 'light-grey',
                };

                return <SimpleRatingBadge rating={performanceItem} />;
              },
              exportCellStyle: exportStyleFromOption(
                (item) =>
                  getAppetitePerformanceByValue(item.AppetitePerformance) ?? {
                    label: '-',
                    color: 'light-grey',
                  }
              ),
            },
          }),
      ...(isEnterpriseRiskEnabled
        ? {
            Entity: {
              header: st('entity'),
            },
            EnterpriseRiskLabelled: {
              header: st('enterprise_risk'),
              cell: (item) => {
                return item.enterpriseRiskInstance?.enterpriseRisk ? (
                  <Badge className={styles.badgeEnterprise}>
                    {item.EnterpriseRiskLabelled}
                  </Badge>
                ) : (
                  <Badge className={styles.badgeEntity}>
                    {item.EnterpriseRiskLabelled}
                  </Badge>
                );
              },
            },
          }
        : {}),
      tags: tagField,
      departments: departmentField,
      //------------------
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      Description: {
        formId: 'risk',
        fieldId: 'Description',
        cell: (item) => item.Description || '-',
        maxWidth: MAX_COL_WIDTH,
      },

      Id: {
        header: t('guid'),
      },
      CreatedByUser: {
        header: t('created_by_id'),
      },
      ParentRiskId: {
        header: st('associated_risk_id'),
        cell: (item) => item.ParentRiskId || '-',
      },
      UserName: {
        header: t('created_by_username'),
      },
      LatestRatingDate: dateColumnFromConfig({
        header: { header: st('latest_rating_date') },
        dateField: 'LatestRatingDate',
      }),
      NextTestDate: dateColumnFromConfig({
        header: { header: st('next_test_date') },
        dateField: 'NextTestDate',
      }),
      NextTestOverdueDate: dateColumnFromConfig({
        header: { header: st('nextTestOverdue') },
        dateField: 'NextTestOverdueDate',
      }),
      TestScheduleStatusLabelled: {
        header: st('testScheduleStatus'),
        cell: (item) => {
          if (!item.TestScheduleStatus || item.TestScheduleStatus === '-') {
            return '-';
          }

          return (
            <SimpleRatingBadge
              rating={getByValueTestScheduleStatus(item.TestScheduleStatus)}
            >
              {item.TestScheduleStatusLabelled}
            </SimpleRatingBadge>
          );
        },
      },
      TestFrequency: {
        header: st('test_frequency'),
        cell: (item) => {
          return item.TestFrequency ?? '-';
        },
      },
      LinkedIndicatorCount: {
        header: st('linked_indicators'),
        cell: (item) => (
          <IndicatorsPopover id={item.Id} count={item.LinkedIndicatorCount} />
        ),
      },
    };
  }, [
    at,
    contributorsField,
    departmentField,
    getAppetiteByValue,
    getAppetitePerformanceByValue,
    getImpactPerformanceByValue,
    resolveImpact,
    resolveLikelihood,
    resolveRiskRating,
    getInherentByValue,
    getRatingTrendByValue,
    getByValueTestScheduleStatus,
    getResidualByValue,
    maxInherentRating,
    maxResidualRating,
    onEditRating,
    riskModel,
    impactsEnabled,
    ownersField,
    posture,
    riskScoreFormatters,
    st,
    t,
    tagField,
    isEnterpriseRiskEnabled,
  ]);
};

const useGetRiskTableProps = (
  records: RiskFields[] | undefined,
  riskScores: RiskScore[] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined,
  onEditRating?: (ratingId: string) => void
): UseGetTablePropsOptions<RiskRegisterFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'risks' });
  const fields = useGetFieldConfig(onEditRating);
  const ratingCustomFields = useRatingCustomAttributeFields();
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const labelledFields = useGetLabelledFields(
    records,
    riskScores,
    impactAppetites
  );

  const allFields = useMemo(
    () => ({ ...fields, ...ratingCustomFields }),
    [fields, ratingCustomFields]
  );

  return useMemo<UseGetTablePropsOptions<RiskRegisterFields>>(() => {
    const nonImpactCols: (keyof RiskRegisterFields)[] = impactsEnabled
      ? []
      : ['UncontrolledRatingLabelled', 'ControlledRatingLabelled'];

    return {
      data: labelledFields,
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:risk'}>
          <Button href={addRiskUrl()}>{st('create_button')}</Button>
        </Permission>
      ),
      preferencesStorageKey: 'RiskRegisterTable-PreferencesV2',
      tableId: 'riskRegister',
      enableFiltering: true,
      initialColumns: [
        'Title',
        'ParentTitle',
        'TierLabelled',
        'allOwners',
        ...nonImpactCols,
        'LinkedControlCount',
        'tags',
      ],
      fields: allFields,
      customAttributeFormIds: ['risk'],
    };
  }, [allFields, impactsEnabled, labelledFields, st]);
};

export const useGetCollectionTableProps = (
  records: RiskFields[] | undefined,
  riskScores: RiskScore[] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined,
  onEditRating?: (ratingId: string) => void
): TablePropsWithActions<RiskRegisterFields> => {
  const props = useGetRiskTableProps(
    records,
    riskScores,
    impactAppetites,
    onEditRating
  );

  return useGetTableProps(props);
};

export const useGetCollectionStatelessTableProps = (
  records: RiskFields[] | undefined,
  riskScores: RiskScore[] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined,
  onEditRating?: (ratingId: string) => void
): TablePropsWithActions<RiskRegisterFields> => {
  const props = useGetRiskTableProps(
    records,
    riskScores,
    impactAppetites,
    onEditRating
  );

  return useGetTablePropsWithoutUrlHash(props);
};

export const useGetRiskSmartWidgetTableProps = (
  records: RiskFields[] | undefined,
  riskScores: RiskScore[] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined,
  statefulTableOptions: StatefulTableOptions<RiskRegisterFields>
): TablePropsWithActions<RiskRegisterFields> => {
  const props = useGetRiskTableProps(records, riskScores, impactAppetites);

  return useGetStatelessTableProps<RiskRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
