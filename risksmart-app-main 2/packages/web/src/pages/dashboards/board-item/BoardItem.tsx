import { BoardItem as CSBoardItem } from '@cloudscape-design/board-components';
import { type FC, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

import { useDashboardWidgetSettings } from '../../../context/useDashboardWidgetSettings';
import styles from './style.module.scss';

type Props = {
  title: string;
  children: ReactNode | (() => ReactNode);
  headerVariant: 'h3' | 'h4' | 'h5';
  settings?: ReactNode;
  usePaletteStyle?: boolean;
  centerAlignHeader?: boolean;
  disableContentPaddings?: boolean;
  testId?: string;
};

const BoardItem: FC<Props> = ({
  title,
  children,
  settings,
  usePaletteStyle,
  headerVariant,
  disableContentPaddings,
  testId,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });
  const [widgetSettings] = useDashboardWidgetSettings<{
    title?: string;
  }>();

  const headerTitle = useMemo(
    () => `${widgetSettings?.title ?? title}`,
    [widgetSettings?.title, title]
  );

  const renderTooltip = (headerTitle: string) => {
    if (headerTitle.length > 45) {
      return (
        <Tooltip
          variant={'light'}
          place={'bottom'}
          id={`widget-title-${headerTitle.toLowerCase()}`}
          border={'2px solid #ededf2'}
          style={{
            padding: '8px 12px',
            maxWidth: '250px',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          {headerTitle}
        </Tooltip>
      );
    }
  };

  return (
    <span
      data-testid={testId}
      className={usePaletteStyle ? styles.paletteItem : styles.boardItem}
    >
      <CSBoardItem
        disableContentPaddings={disableContentPaddings}
        header={
          <div className={'flex space-x-2 items-center h-[32px]'}>
            {headerVariant === 'h3' ? (
              <h5
                className={
                  'grow m-[0] text-[20px] leading-[24px] font-bold truncate text-ellipsis'
                }
                data-tooltip-id={`widget-title-${headerTitle.toLowerCase()}`}
              >
                {headerTitle}
                {renderTooltip(headerTitle)}
              </h5>
            ) : (
              <h5
                className={
                  'grow m-[0] text-[14px] leading-[18px] font-semibold text-center truncate text-ellipsis'
                }
                data-tooltip-id={`widget-title-${headerTitle.toLowerCase()}`}
              >
                {headerTitle}
                {renderTooltip(headerTitle)}
              </h5>
            )}

            <div className={'flex-none'}></div>
          </div>
        }
        settings={settings}
        i18nStrings={{
          dragHandleAriaLabel: t('drag_handle'),
          dragHandleAriaDescription: t('drag_handle_description'),
          resizeHandleAriaLabel: t('resize_handle'),
          resizeHandleAriaDescription: t('resize_handle_description'),
        }}
      >
        {typeof children === 'function' ? children() : children}
      </CSBoardItem>
    </span>
  );
};

export default BoardItem;
