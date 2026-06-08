import type { RatingOption } from '@risksmart-app/components/src/hooks/types';

export type CellDataProps = {
  getPlacematColor: (value: number) => null | string;
  value: number;
  label: string;
  isAggregateSuggestion?: boolean;
};

export type AggregateColumnScoreLabel =
  | 'Acceptable'
  | 'Crucial'
  | 'Minimal'
  | 'Opportunity'
  | 'Severe'
  | 'Uncomfortable';

export type ColumnSummaryCellDataProps = {
  options: RatingOption[];
  value: number;
  label: string;
};

export type ImpactRatings = Record<string, number>;
export type PlacematRatings = {
  [p: string]: {
    riskName: null | string;
    likelihood: number;
    ratings: ImpactRatings;
  };
};
