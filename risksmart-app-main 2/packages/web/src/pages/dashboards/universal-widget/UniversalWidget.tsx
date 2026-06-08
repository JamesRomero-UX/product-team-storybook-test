import type { Ref } from 'react';
import { useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { useDashboardWidgetSettings } from '../../../context/useDashboardWidgetSettings';
import type { WidgetRef } from '../types';
import ConfigureWidgetPanel from './ConfigureWidgetPanel';
import { dataSources } from './data-sources';
import { FilterPreview } from './FilterPreview';
import { UniversalWidgetSettingsModal } from './form/UniversalWidgetSettingsModal';
import { settingsSchema } from './settingsSchema';
import { settingsToTitle } from './settingsToTitle';
import { UniversalChart } from './UniversalChart';
import type { GigawidgetSettings } from './util';

export const UniversalWidget = (_props: unknown, ref: Ref<WidgetRef>) => {
  const [settings, setSettings] =
    useDashboardWidgetSettings<GigawidgetSettings>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const dataSource = useMemo(() => {
    if (settings) {
      return dataSources[settings.dataSource];
    }
  }, [settings]);

  const [allowOwnershipFiltering, noClickthroughMessageContent] = useMemo(
    () => [
      settings?.allowOwnershipFiltering,
      settings?.noClickthroughMessageContent,
    ],
    [settings?.allowOwnershipFiltering, settings?.noClickthroughMessageContent]
  );

  const [isSettingsValid, setIsSettingsValid] = useState(false);
  useEffect(() => {
    if (!settings) {
      setIsSettingsValid(false);

      return;
    }

    setIsSettingsValid(settingsSchema.safeParse(settings).success);
  }, [settings]);

  useImperativeHandle(
    ref,
    (): WidgetRef => ({
      openSettings: () => setShowSettingsModal(true),
    })
  );

  return (
    <div className={'h-full flex flex-col gap-2'}>
      {showSettingsModal && (
        <UniversalWidgetSettingsModal
          onDismiss={() => setShowSettingsModal(false)}
          onSave={async (data) =>
            setSettings({
              ...(data as GigawidgetSettings),
              allowOwnershipFiltering,
              noClickthroughMessageContent,
              title: data.customTitle
                ? (data.title ?? '')
                : settingsToTitle(data as GigawidgetSettings),
            })
          }
        />
      )}

      {!settings || !dataSource ? (
        <ConfigureWidgetPanel
          onConfigureClick={() => setShowSettingsModal(true)}
        />
      ) : null}

      {settings && dataSource && (
        <div className={'flex-1'}>
          <UniversalChart settings={settings} dataSource={dataSource} />
        </div>
      )}

      {(settings?.filtering?.tokens?.length ?? 0) > 0 &&
      dataSource &&
      settings &&
      isSettingsValid &&
      settings.showFilters ? (
        <div className={'print:hidden'}>
          <FilterPreview settings={settings} dataSource={dataSource} />
        </div>
      ) : null}
    </div>
  );
};

UniversalWidget.displayName = 'UniversalWidget';
