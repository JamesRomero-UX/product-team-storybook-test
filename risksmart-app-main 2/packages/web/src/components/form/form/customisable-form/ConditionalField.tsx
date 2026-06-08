import type { PropsWithChildren } from 'react';

import { useRiskSmartForm } from './RiskSmartFormContext';

export type Props = {
  condition?: boolean | null;
};

function ConditionalField({ condition, children }: PropsWithChildren<Props>) {
  const { editMode } = useRiskSmartForm();

  // show all fields when editing
  const showFields = condition || editMode;

  return showFields ? children : null;
}

export default ConditionalField;
