import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Ref } from 'react';

import type { WidgetRef } from '../../types';
import { RiskHeatmap } from './RiskHeatmap';

export const ControlledRiskHeatmap = (_props: unknown, ref: Ref<WidgetRef>) => {
  return (
    <RiskHeatmap
      ref={ref}
      controlType={Risk_Assessment_Result_Control_Type_Enum.Controlled}
    />
  );
};
