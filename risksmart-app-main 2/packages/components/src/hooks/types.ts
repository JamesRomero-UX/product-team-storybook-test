import type { KeyPrefix } from 'i18next';

export type RatingKey =
  | KeyPrefix<'ratings'>
  | KeyPrefix<'internal_audit_ratings'>;

interface BaseRating<T = number | string> {
  label: string;
  value: T;
  range?: number[];
  color?: string;
}
export interface RatingWithColor<T = number | string> {
  label: string;
  value: T;
  color: string;
  range?: readonly [number, number];
}
export interface RatingWithRange<T = number | string> {
  label: string;
  value: T;
  range: readonly [number, number];
  color?: string;
}

export interface RatingWithColorAndLikelihoodImpact<T = number | string> {
  label: string;
  value: T;
  range: readonly [number, number];
  color: string;
  likelihoodImpact: {
    impact: number;
    likelihood: number;
  }[];
}

export interface RatingWithColorAndRange<T = number | string> {
  label: string;
  value: T;
  range: readonly [number, number];
  color: string;
}

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
