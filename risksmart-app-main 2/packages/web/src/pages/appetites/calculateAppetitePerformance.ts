import _ from 'lodash';

export const APPETITE_PERFORMANCE = {
  INSIDE: 'inside',
  OUTSIDE: 'outside',
} as const;

export type AppetitePerformance =
  (typeof APPETITE_PERFORMANCE)[keyof typeof APPETITE_PERFORMANCE];

export const getAppetitePerformance = ({
  controlledRating,
  UpperAppetite,
  LowerAppetite,
  posture,
}: {
  controlledRating: null | number | undefined;
  UpperAppetite?: null | number | undefined;
  LowerAppetite?: null | number | undefined;
  posture: boolean | null;
}): AppetitePerformance | null => {
  if (_.isNil(controlledRating)) {
    return null;
  }

  if (posture && (_.isNil(UpperAppetite) || UpperAppetite === 0)) {
    return null;
  }

  if (
    !posture &&
    (_.isNil(UpperAppetite) ||
      _.isNil(LowerAppetite) ||
      UpperAppetite === 0 ||
      LowerAppetite === 0)
  ) {
    return null;
  }

  if (posture) {
    if (UpperAppetite == null) {
      throw new Error('upperThreshold is null');
    }

    return controlledRating <= UpperAppetite
      ? APPETITE_PERFORMANCE.INSIDE
      : APPETITE_PERFORMANCE.OUTSIDE;
  }
  if (UpperAppetite == null) {
    throw new Error('upperThreshold is null');
  }
  if (LowerAppetite == null) {
    throw new Error('lowerThreshold is null');
  }
  if (
    controlledRating >= LowerAppetite &&
    Math.floor(controlledRating) <= UpperAppetite
  ) {
    return APPETITE_PERFORMANCE.INSIDE;
  } else {
    return APPETITE_PERFORMANCE.OUTSIDE;
  }
};
