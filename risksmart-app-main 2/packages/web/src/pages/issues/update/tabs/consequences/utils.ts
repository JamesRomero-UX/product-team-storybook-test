import type { Cost_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { roundToTwoDecimals } from '@/utils/numberUtils';

export const calculateCostTotal = (
  consequences: { CostType: Cost_Type_Enum; CostValue: number }[],
  costType: Cost_Type_Enum
) => {
  const total = consequences
    .filter((c) => c.CostType === costType)
    .reduce((previous, current) => previous + current.CostValue, 0);

  // Round to 2 decimal places to handle floating point precision issues
  return roundToTwoDecimals(total);
};

export const getCost = (
  consequence: { CostType: Cost_Type_Enum; CostValue: number },
  costType: Cost_Type_Enum
) => {
  if (consequence.CostType === costType) {
    return consequence.CostValue;
  }

  return 0;
};
