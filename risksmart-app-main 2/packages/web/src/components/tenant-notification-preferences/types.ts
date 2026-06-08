import type {
  EnabledChannel,
  PreferenceCategory,
} from '@risksmart-app/shared/knock/schemas';

export type WorkflowPreferenceRow = {
  workflowKey: string;
  label: string;
  category: PreferenceCategory;
  enforced: boolean;
  channels: Record<EnabledChannel, boolean>;
};

export type CategorySummaryRow = {
  category: PreferenceCategory;
  label: string;
  enforced: boolean;
  channels: Record<EnabledChannel, boolean>;
  isExpanded: boolean;
};
