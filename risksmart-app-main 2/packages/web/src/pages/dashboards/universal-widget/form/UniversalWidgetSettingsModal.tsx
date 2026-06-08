import { ModalWrapper } from 'src/components/form/form/ModalWrapper';

import { useDashboardWidgetSettings } from '../../../../context/useDashboardWidgetSettings';
import type { SettingsSchema } from '../settingsSchema';
import type { GigawidgetSettings } from '../util';
import { UniversalWidgetSettingsForm } from './UniversalWidgetSettingsForm';

type Props = {
  onDismiss: () => void;
  onSave: (data: SettingsSchema) => Promise<void>;
};

export const UniversalWidgetSettingsModal = ({ onDismiss, onSave }: Props) => {
  const [settings] = useDashboardWidgetSettings<GigawidgetSettings>();

  return (
    <UniversalWidgetSettingsForm
      renderTemplate={(renderProps) => (
        <ModalWrapper {...renderProps} visible={true} />
      )}
      settings={settings}
      onSave={onSave}
      onDismiss={onDismiss}
    />
  );
};
