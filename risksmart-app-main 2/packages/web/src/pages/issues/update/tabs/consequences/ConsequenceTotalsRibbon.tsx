import { Cost_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TotalsRibbon from 'src/components/totals-ribbon';

import { calculateCostTotal } from './utils';

type Props = {
  consequences: { CostType: Cost_Type_Enum; CostValue: number }[];
};

const ConsequenceTotalsRibbon: FC<Props> = ({ consequences }) => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences.totals_ribbon',
  });

  const formatFinancialValue = (value: number): string => {
    // Format financial values with 2 decimal places
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <TotalsRibbon
      items={[
        {
          label: st('cost'),
          value: formatFinancialValue(
            calculateCostTotal(consequences, Cost_Type_Enum.Financial)
          ),
        },
        {
          label: st('customers_impacted'),
          value:
            calculateCostTotal(
              consequences,
              Cost_Type_Enum.CustomersImpacted
            ).toLocaleString() ?? '0',
        },
        {
          label: st('hours'),
          value:
            calculateCostTotal(
              consequences,
              Cost_Type_Enum.Hours
            ).toLocaleString() ?? '0',
        },
      ]}
    />
  );
};

export default ConsequenceTotalsRibbon;
