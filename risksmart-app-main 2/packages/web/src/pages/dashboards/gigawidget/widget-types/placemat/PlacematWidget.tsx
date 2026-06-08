import { useQuery } from '@apollo/client';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetImpactRatingsWithAppetitesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { useLabelledFields } from '../../../../impacts/ratings/useLabelledFields';
import type { dataSources } from '../../../universal-widget/data-sources';
import { HeatmapCell } from '../../../widgets/heatmap-widget/HeatmapCell';
import { useGetWidgetData } from '../../hooks/useGetWidgetData';
import type { WidgetDataSource } from '../../types';
import type { GigaTableWidgetProps } from '../table/GigaTableWidget';
import {
  cellData,
  columnSummaryCellData,
  totalAggregatedScoreAcrossAllRisks,
  totalLikelihoodScoreAcrossAllRisks,
  totalRiskImpactRating,
  totalSingleImpactScoreAcrossAllRisks,
} from './placematWidgetUtils';
import styles from './styles.module.scss';
import type { PlacematRatings } from './types';
import { useCalculatePlacematRatings } from './useCalculatePlacematRatings';

export const PlacematWidget = <TDataSource extends WidgetDataSource>({
  dataSource,
  variables,
  dateFilterOptions,
  propertyFilterQuery,
}: GigaTableWidgetProps<TDataSource>) => {
  const { getColorClass: getPlacematColor } = useRating('impact_placemat');
  const { options: aggregateColumnScoreOptions } = useRating(
    'impact_placemat_aggregate_column_score'
  );
  const { tableProps } = useGetWidgetData<(typeof dataSources)['risk']>({
    dataSource,
    variables,
    dateFilterOptions,
    propertyFilterQuery,
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.widgets.placemat',
  });

  const { data, loading } = useQuery(GetImpactRatingsWithAppetitesDocument, {
    fetchPolicy: 'network-only',
    variables: { today: dayjs().endOf('day').toISOString() },
  });
  const impactRatings = useLabelledFields(data?.impact_rating) ?? [];
  const impactIds = Array.from(
    new Set(impactRatings?.map((rating) => rating.ImpactId) ?? [])
  );
  const placematRatings: PlacematRatings = useCalculatePlacematRatings(
    tableProps.allItems ?? [],
    impactRatings ?? [],
    data
  );

  const getRiskName = (riskId: string) => {
    const risk = tableProps.allItems?.find((risk) => risk.Id === riskId);

    return risk?.Title ?? riskId;
  };
  const getImpactName = (impactId: string) => {
    const impact = impactRatings?.find(
      (rating) => rating.ImpactId === impactId
    );

    return impact?.impact?.Name ?? impactId;
  };

  {
    /* STYLING */
  }
  const numberOfImpactsIncludingLikelihood = impactIds.length + 1;
  const numberOfRisks = Object.values(placematRatings).length;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `max-content repeat(${numberOfImpactsIncludingLikelihood}, 1fr) repeat(2, min-content)`,
    gridTemplateRows: `min-content repeat(${numberOfRisks}, 1fr) 1fr`,
    height: '100%',
  };

  const emptyImpactCellBackground = '#f2f2f2';

  const columnHeaderStyling =
    'flex items-center justify-center text-center font-semibold px-3 py-2';
  const rowHeaderStyling = 'flex items-center justify-end text-right pr-4';

  const ratingCellStyling =
    'flex justify-center items-center w-full h-full rounded-md box-border px-4';
  const ratingCellWrapperPadding = 'p-2';
  const summaryRatingCellWrapperPadding = 'px-2 py-3';

  return loading ? (
    <Spinner />
  ) : (
    <div style={gridStyle} className={styles.placematWidget}>
      {/* IMPACT COLUMNS */}
      <div className={`${columnHeaderStyling} ${styles.borderBottomDotted}`}>
        {t('principalRisks')}
      </div>

      {impactIds.map((impactId, i) => (
        <div
          className={`${columnHeaderStyling} ${styles.borderBottomDotted} ${styles.borderLeftSolid}`}
          key={i}
        >
          {getImpactName(impactId)}
        </div>
      ))}

      <div
        className={`${columnHeaderStyling} ${styles.borderBottomDotted} ${styles.borderLeftSolid}`}
      >
        {t('likelihood')}
      </div>

      <div
        className={`${columnHeaderStyling} ${styles.borderBottomTransparent} ${styles.borderXTransparent} ${styles.greyBackground}`}
      >
        {t('aggregatedScore')}
      </div>
      <div
        className={`${columnHeaderStyling} ${styles.borderBottomTransparent} ${styles.borderXTransparent} ${styles.blueBackground} text-white rounded-tr-lg`}
      >
        {t('opportunityVsAction')}
      </div>

      {/* RISK ROWS */}
      {Object.values(placematRatings).map((item, i) => {
        const { riskName, likelihood, ratings } = item;

        const totalRiskImpactRatingIncludingLikelihood =
          totalRiskImpactRating(ratings) + likelihood;

        return (
          <Fragment key={i}>
            <div className={`${rowHeaderStyling} ${styles.borderBottomDotted}`}>
              {getRiskName(Object.keys(placematRatings)[i])}
            </div>

            {impactIds.map((impactId, i) => {
              const impactAssociatedWithThisRisk =
                ratings[impactId] !== undefined;
              const data = impactAssociatedWithThisRisk
                ? cellData({
                    getPlacematColor,
                    label: `${getImpactName(impactId)} ${t('impactScore')}`,
                    value: ratings[impactId],
                  })
                : {
                    value: '',
                    background: emptyImpactCellBackground,
                    label: `${getImpactName(impactId)} ${t('impactScore')}`,
                  };

              return (
                <div
                  className={`${ratingCellWrapperPadding} ${styles.borderBottomDotted} ${styles.borderLeftSolid}`}
                  key={i}
                >
                  <HeatmapCell
                    data={data}
                    className={`${ratingCellStyling} ${styles.placematCell}`}
                    onMouseOver={() => null}
                  />
                </div>
              );
            })}
            <div
              className={`${ratingCellWrapperPadding} ${styles.borderBottomDotted} ${styles.borderLeftSolid}`}
            >
              <HeatmapCell
                data={cellData({
                  getPlacematColor,
                  label: `${riskName} ${t('likelihood')}`,
                  value: likelihood,
                })}
                className={`${ratingCellStyling} ${styles.placematCell}`}
                onMouseOver={() => null}
                key={t('likelihood')}
              />
            </div>

            <div
              className={`${ratingCellWrapperPadding} ${styles.borderBottomTransparent} ${styles.borderXTransparent} ${styles.greyBackground}`}
            >
              <HeatmapCell
                data={cellData({
                  getPlacematColor,
                  label: `${riskName} ${t('aggregatedScore')}`,
                  value: totalRiskImpactRatingIncludingLikelihood,
                })}
                className={`${ratingCellStyling} ${styles.placematCell}`}
                onMouseOver={() => null}
              />
            </div>
            <div
              className={`${ratingCellWrapperPadding} ${styles.borderBottomTransparent} ${styles.borderXTransparent} ${styles.blueBackground}`}
            >
              <HeatmapCell
                data={cellData({
                  getPlacematColor,
                  label: `${riskName} ${t('aggregatedSuggestion')}`,
                  value: totalRiskImpactRatingIncludingLikelihood,
                  isAggregateSuggestion: true,
                })}
                className={`${ratingCellStyling} ${styles.placematCell}`}
                onMouseOver={() => null}
              />
            </div>
          </Fragment>
        );
      })}

      {/* SUMMARY */}
      <div className={`${rowHeaderStyling} font-semibold`}>
        {t('aggregatedScore')}
      </div>

      {Object.values(impactIds).map((impactId, i) => {
        return (
          <div
            className={`${summaryRatingCellWrapperPadding} ${styles.borderLeftTransparent} ${styles.blueBackground}`}
            key={i}
          >
            <HeatmapCell
              data={columnSummaryCellData({
                options: aggregateColumnScoreOptions,
                value: totalSingleImpactScoreAcrossAllRisks(
                  impactId,
                  placematRatings
                ),
                label: `${getImpactName(impactId)} ${t('impactSummary')}`,
              })}
              className={`${ratingCellStyling} ${styles.placematCell}`}
              onMouseOver={() => null}
            />
          </div>
        );
      })}

      <div
        className={`${summaryRatingCellWrapperPadding} ${styles.borderLeftTransparent} ${styles.blueBackground}`}
      >
        <HeatmapCell
          data={columnSummaryCellData({
            options: aggregateColumnScoreOptions,
            value: totalLikelihoodScoreAcrossAllRisks(placematRatings),
            label: t('likelihoodSummary'),
          })}
          className={`${ratingCellStyling} ${styles.placematCell}`}
          onMouseOver={() => null}
        />
      </div>

      <div
        className={`${summaryRatingCellWrapperPadding} ${styles.borderXTransparent} ${styles.blueBackground}`}
      >
        <HeatmapCell
          data={columnSummaryCellData({
            options: aggregateColumnScoreOptions,
            value: totalAggregatedScoreAcrossAllRisks(placematRatings),
            label: t('aggregatedScoreSummary'),
          })}
          className={`${ratingCellStyling} ${styles.placematCell}`}
          onMouseOver={() => null}
        />
      </div>

      <div
        className={`${summaryRatingCellWrapperPadding} ${styles.borderXTransparent} ${styles.blueBackground} rounded-br-lg`}
      ></div>
    </div>
  );
};
