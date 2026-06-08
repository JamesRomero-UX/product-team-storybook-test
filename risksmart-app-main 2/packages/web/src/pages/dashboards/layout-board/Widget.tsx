import type { BoardProps } from '@cloudscape-design/board-components';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import { ErrorBoundary } from '@sentry/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonDropdown from 'src/components/button-dropdown';

import BoardItem from '../board-item/BoardItem';
import type { StoredWidgetDefinition, WidgetRef } from '../types';
import {
  type ExportFn,
  useWidgetContext,
  WidgetContextProvider,
} from '../widget-context/WidgetContext';

type Props = {
  item: BoardProps.Item<StoredWidgetDefinition>;
  onRemove?: () => void;
};

export const Widget = ({ item, onRemove }: Props) => {
  const { t } = useTranslation(['common']);
  const [ref, setRef] = useState<null | WidgetRef>(null);
  const [exportFns, setExportFns] = useState<ExportFn[]>([]);

  const widgetTranslations = t(item.data.translationKeyPrefix, {
    returnObjects: true,
  });

  const menuItems = [{ id: 'remove', text: t('dashboard.remove_button') }];

  if (ref?.openSettings) {
    menuItems.push({ id: 'settings', text: t('widget.settings') });
  }

  const setWidgetRef = (widgetRef: WidgetRef) => {
    if (!!widgetRef && (!ref || ref.key !== widgetRef.key)) {
      setRef(widgetRef);
    }
  };

  const contextValue = useMemo(
    () => ({
      widgetId: item.id,
      exportFns,
      setExportFns,
    }),
    [item.id, exportFns]
  );

  return (
    <WidgetContextProvider value={contextValue}>
      <BoardItem
        title={item.data.hideTitle ? '' : widgetTranslations.title}
        centerAlignHeader={item.data.centerAlignHeader}
        disableContentPaddings={item.data.disableContentPaddings}
        headerVariant={
          item.rowSpan === 2 || item.columnSpan === 1 ? 'h4' : 'h3'
        }
        settings={
          <Settings openSettings={ref?.openSettings} onRemove={onRemove} />
        }
      >
        <ErrorBoundary
          fallback={
            <Alert header={t('widget.error_fallback_title')} type={'error'}>
              {t('widget.error_fallback')}
            </Alert>
          }
        >
          <item.data.content ref={setWidgetRef} />
        </ErrorBoundary>
      </BoardItem>
    </WidgetContextProvider>
  );
};

const Settings = ({
  openSettings,
  onRemove,
}: {
  openSettings?: () => void;
  onRemove?: () => void;
}) => {
  const widgetData = useWidgetContext();
  const { t } = useTranslation(['common']);

  const menuItems = [{ id: 'remove', text: t('dashboard.remove_button') }];

  if (openSettings) {
    menuItems.push({ id: 'settings', text: t('widget.settings') });
  }

  if (widgetData?.exportFns?.length) {
    menuItems.push(
      ...widgetData.exportFns.map(({ id, text }) => ({
        id,
        text,
      }))
    );
  }

  return (
    <div className={'flex items-center h-[32px]'}>
      <ButtonDropdown
        // expandToViewport
        items={menuItems}
        noPadding
        ariaLabel={t('dashboard.widget_settings')}
        variant={'icon'}
        onItemClick={(e) => {
          if (e.detail.id === 'remove') {
            onRemove?.();
          } else if (e.detail.id === 'settings') {
            openSettings?.();
          } else {
            widgetData?.exportFns?.find((fn) => fn.id === e.detail.id)?.fn();
          }
        }}
      />
    </div>
  );
};
