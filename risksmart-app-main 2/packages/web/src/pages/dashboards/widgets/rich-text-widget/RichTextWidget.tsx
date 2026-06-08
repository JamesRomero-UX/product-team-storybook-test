import Button from '@risksmart-app/components/src/button';
import type Highcharts from 'highcharts';
import type { Ref } from 'react';
import { useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';

import { useDashboardWidgetSettings } from '../../../../context/useDashboardWidgetSettings';
import { HighchartsWidget } from '../../HighchartsWidget';
import type { WidgetRef } from '../../types';
import { EditorModal } from './EditorModal';
import type { WidgetSettings } from './widgetSettingsSchema';

export const RichTextWidget = (_props: unknown, ref: Ref<WidgetRef>) => {
  const [settings, setSettings] = useDashboardWidgetSettings<WidgetSettings>();
  const [showModal, setShowModal] = useState(false);
  const textEl = useRef<Highcharts.SVGElement | null>(null);

  const { t } = useTranslation('common', {
    keyPrefix: 'dashboard.widgets.richText',
  });

  useImperativeHandle(ref, () => ({
    openSettings: () => setShowModal(true),
  }));

  const handleSave = async (data: WidgetSettings) => {
    setSettings({ ...data, content: sanitizeHtml(data.content) });
  };

  const html = sanitizeHtml(settings?.content ?? '');

  const options: Highcharts.Options = {
    chart: {
      type: 'richText',
      animation: false,
      events: {
        render: function () {
          if (textEl.current) {
            textEl.current.destroy();
          }
          const renderer = this.renderer;
          textEl.current = renderer
            .text(
              `<span style="text-wrap: auto; overflow: auto; max-width: 100%; max-height: 100%; display: block;">${html}</span>`,
              0,
              0,
              true
            )
            .css({
              overflow: 'auto',
              maxHeight: this.plotHeight + 'px',
              wordWrap: 'break-word',
            })
            .add();
        },
      },
    },
  };

  return (
    <>
      {showModal && (
        <EditorModal
          onDismiss={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      <div className={'rich-text-widget'} style={{ height: '100%' }}>
        {!settings ||
        (settings.allowOwnershipFiltering && !settings.content) ? (
          <div className={'flex flex-col justify-center items-center'}>
            <h3 className={'m-0'}>{t('not_configured_title')}</h3>
            <p>{t('not_configured')}</p>
            <Button onClick={() => setShowModal(true)}>
              {t('configure_button')}
            </Button>
          </div>
        ) : (
          <HighchartsWidget options={options} />
        )}
      </div>
    </>
  );
};
