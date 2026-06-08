import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';

import { CustomDataSourceWidgetSettingsForm } from './form/CustomDataSourceWidgetSettingsForm';
import type { CustomDataSourceWidgetSettings } from './form/customDataSourceWidgetSettingsSchema';

type Props = {
  onDismiss: () => void;
  onSave: (data: CustomDataSourceWidgetSettings) => Promise<void>;
};

export const CustomDataSourceWidgetSettingsModel = ({
  onDismiss,
  onSave,
}: Props) => {
  const [values] = useDashboardWidgetSettings<CustomDataSourceWidgetSettings>();

  return (
    <CustomDataSourceWidgetSettingsForm
      values={values ?? undefined}
      onSave={onSave}
      onDismiss={onDismiss}
    />
  );
};
