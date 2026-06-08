import type { RatingOption } from '@risksmart-app/components/src/hooks/types';

import type {
  AggregateColumnScoreLabel,
  CellDataProps,
  ColumnSummaryCellDataProps,
  ImpactRatings,
  PlacematRatings,
} from './types';

export const getSuggestion = (value: number) => {
  if (value < -1) {
    return 'ACTION';
  }
  if (value > 2) {
    return 'OPPORTUNITY';
  }

  return 'ALIGNED';
};

export const getBackgroundValue = (value: number) => {
  if (value < -4) {
    return -4;
  }
  if (value > 4) {
    return 4;
  }

  return value;
};

export const cellData = ({
  getPlacematColor,
  value,
  label,
  isAggregateSuggestion,
}: CellDataProps) => {
  const cellValue = isAggregateSuggestion ? getSuggestion(value) : value;
  const backgroundValue = getPlacematColor(getBackgroundValue(value)) ?? '';

  return {
    value: cellValue,
    background: backgroundValue,
    label,
  };
};

export const getColumnSummaryBackgroundValue = (
  value: number,
  options: RatingOption[]
) => {
  const findValue = (label: AggregateColumnScoreLabel) => {
    return Number(options.find((item) => item.label === label)?.value);
  };
  const findColor = (label: AggregateColumnScoreLabel) =>
    options.find((item) => item.label === label)?.color;

  const isCrucial = value <= findValue('Crucial');
  const isSevere = value <= findValue('Severe') && !isCrucial;
  const isUncomfortable = value <= findValue('Uncomfortable') && !isSevere;
  const isMinimal = value <= findValue('Minimal') && !isUncomfortable;
  const isOpportunity = value >= findValue('Opportunity');

  const crucialColor = findColor('Crucial');
  const severeColor = findColor('Severe');
  const uncomfortableColor = findColor('Uncomfortable');
  const minimalColor = findColor('Minimal');
  const opportunityColor = findColor('Opportunity');
  const acceptableColor = findColor('Acceptable');

  if (isCrucial) {
    return crucialColor;
  }

  if (isSevere) {
    return severeColor;
  }

  if (isUncomfortable) {
    return uncomfortableColor;
  }

  if (isMinimal) {
    return minimalColor;
  }

  if (isOpportunity) {
    return opportunityColor;
  }

  return acceptableColor;
};

export const columnSummaryCellData = ({
  options,
  value,
  label,
}: ColumnSummaryCellDataProps) => ({
  value: value,
  background: getColumnSummaryBackgroundValue(value, options) ?? '',
  label,
});

export const totalRiskImpactRating = (ratings: ImpactRatings) =>
  Object.values(ratings).reduce((acc, curr) => acc + curr, 0);

export const totalSingleImpactScoreAcrossAllRisks = (
  impactId: string,
  placematRatings: PlacematRatings
) =>
  Object.values(placematRatings).reduce((acc, item) => {
    const { ratings } = item;

    return ratings[impactId] ? acc + ratings[impactId] : acc;
  }, 0);

export const totalLikelihoodScoreAcrossAllRisks = (
  placematRatings: PlacematRatings
) =>
  Object.values(placematRatings).reduce((acc, item) => {
    const { likelihood } = item;

    return acc + likelihood;
  }, 0);

export const totalAggregatedScoreAcrossAllRisks = (
  placematRatings: PlacematRatings
) =>
  Object.values(placematRatings).reduce((acc, item) => {
    const { likelihood, ratings } = item;
    const totalImpactRating = Object.values(ratings).reduce(
      (acc, curr) => acc + curr,
      0
    );

    return acc + totalImpactRating + likelihood;
  }, 0);
