import type { KeyPrefix } from 'i18next';

export type RatingKeys = KeyPrefix<'ratings'>;

type BaseRating<T = number | string> = {
  label: string;
  value: T;
  range?: number[];
  color?: string;
};
export type RatingWithColor<T = number | string> = {
  label: string;
  value: T;
  color: string;
  range?: readonly [number, number];
};
export type RatingWithRange<T = number | string> = {
  label: string;
  value: T;
  range: readonly [number, number];
  color?: string;
};

export type RatingWithColorAndLikelihoodImpact<T = number | string> = {
  label: string;
  value: T;
  range: readonly [number, number];
  color: string;
  likelihoodImpact: {
    impact: number;
    likelihood: number;
  }[];
};

export type RatingWithColorAndRange<T = number | string> = {
  label: string;
  value: T;
  range: readonly [number, number];
  color: string;
};

export type RatingOption<T = number | string> =
  | {
      label: string;
      color: string;
      value: null;
      range?: readonly [number, number];
    }
  | BaseRating<T>
  | RatingWithColor<T>
  | RatingWithColorAndLikelihoodImpact<T>
  | RatingWithColorAndRange<T>
  | RatingWithRange<T>;

export type RatingColorsType = string;
