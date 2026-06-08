import { ModalWrapper } from 'src/components/form/form/ModalWrapper';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';

import type { WidgetDataSource } from '../../gigawidget/types';
import type { FilterSettings } from '../../universal-widget/util';
import { WidgetSettingsForm } from './WidgetSettingsForm';

type Props<TDataSource extends WidgetDataSource> = {
  onDismiss: () => void;
  onSave: (data: FilterSettings) => Promise<void>;
  dataSource: TDataSource;
};

export const WidgetSettingsModal = <TDataSource extends WidgetDataSource>({
  onDismiss,
  onSave,
  dataSource,
}: Props<TDataSource>) => {
  const [settings] = useDashboardWidgetSettings<FilterSettings>();

  return (
    <WidgetSettingsForm
      renderTemplate={(renderProps) => (
        <ModalWrapper {...renderProps} visible={true} />
      )}
      settings={settings}
      onSave={onSave}
      onDismiss={onDismiss}
      dataSource={dataSource}
    />
  );
};
