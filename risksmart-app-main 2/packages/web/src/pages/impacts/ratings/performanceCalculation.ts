import _ from 'lodash';

import type { ImpactRating } from './types';

enum ImpactPerformance {
  Outside = 'outside',
  Unrated = 'unrated',
  Within = 'within',
}

export enum ImpactPerformanceRating {
  Above = 'above',
  Aligned = 'aligned',
  Below = 'below',
}

export enum LikelihoodPerformance {
  Outside = 'outside',
  Unrated = 'unrated',
  Within = 'within',
}

export const getImpactPerformanceRating = (
  item: Pick<ImpactRating, 'Rating'>,
  impactAppetite?: null | number
): ImpactPerformance => {
  if (!_.isNil(item.Rating) && !_.isNil(impactAppetite)) {
    return item.Rating <= impactAppetite
      ? ImpactPerformance.Within
      : ImpactPerformance.Outside;
  }

  return ImpactPerformance.Unrated;
};

export const getLikelihoodPerformanceRating = (
  item: Pick<ImpactRating, 'Likelihood'>,
  likelihoodAppetite?: null | number
): LikelihoodPerformance => {
  if (item.Likelihood && likelihoodAppetite) {
    return item.Likelihood <= likelihoodAppetite
      ? LikelihoodPerformance.Within
      : LikelihoodPerformance.Outside;
  }

  return LikelihoodPerformance.Unrated;
};

export const getPerformanceRatingFromPerformanceScore = (
  performanceScore: null | number
) => {
  if (performanceScore == null) {
    return ImpactPerformance.Unrated;
  }

  return performanceScore >= 0
    ? ImpactPerformance.Within
    : ImpactPerformance.Outside;
};

export const getPerformanceRatingFromRatingAndAppetite = ({
  rating,
  impactAppetite,
}: {
  rating: number;
  impactAppetite: null | number | undefined;
}) => {
  const performanceRating = getImpactPerformanceScore(rating, impactAppetite);

  return getPerformanceRating(performanceRating);
};

export const getPerformanceRating = (
  performanceScore: null | number
): ImpactPerformanceRating | null => {
  if (performanceScore === null) {
    return null;
  }
  if (performanceScore > 0) {
    return ImpactPerformanceRating.Above;
  }
  if (performanceScore < 0) {
    return ImpactPerformanceRating.Below;
  }

  return ImpactPerformanceRating.Aligned;
};

export const getImpactPerformanceScore = (
  rating: number,
  impactAppetite: null | number | undefined
): null | number => {
  if (_.isNil(impactAppetite)) {
    return null;
  }

  return impactAppetite - rating;
};

export const getLikelihoodPerformanceScore = (
  item: {
    Likelihood?: null | number | undefined;
  },
  likelihoodAppetite: null | number | undefined
): null | number => {
  if (_.isNil(likelihoodAppetite) || _.isNil(item.Likelihood)) {
    return null;
  }

  return likelihoodAppetite - item.Likelihood;
};
