import _ from 'lodash';

export interface Rating {
  label: string;
  value: number;
  range?: [number, number];
  likelihoodImpact?: {
    impact: number;
    likelihood: number;
  }[];
}

/**
 * Retrieve a rating option by range
 * @param options
 * @param value
 * @returns
 */
export const getRatingByRange = (options: Rating[], value: number | null) => {
  if (_.isNil(value)) {
    return undefined;
  }

  return options.find((r) => {
    if (!r.range || r.range.length !== 2) {
      return undefined;
    }

    return value >= r.range[0] && Math.floor(value) <= r.range[1];
  });
};

export const getRatingByLikelihoodAndImpact = (
  options: Rating[],
  likelihood: number | null | undefined,
  impact: number | null | undefined
) => {
  if (_.isNil(likelihood) || _.isNil(impact)) {
    return undefined;
  }

  return options.find((r) => {
    return r.likelihoodImpact?.some(
      (li) => li.likelihood === likelihood && li.impact === impact
    );
  });
};
