import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Ref } from 'react';
import type { WidgetRef } from 'src/pages/dashboards/types';

import { RiskRatingsOverTime } from './RiskRatingsOverTime';

export const ControlledRiskRatingsOverTime = (
  _props: unknown,
  ref: Ref<WidgetRef>
) => {
  return (
    <RiskRatingsOverTime
      ref={ref}
      controlType={Risk_Assessment_Result_Control_Type_Enum.Controlled}
    />
  );
};
