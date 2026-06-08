import type { BoardProps } from '@cloudscape-design/board-components/board';
import { useTranslation } from 'react-i18next';

import type { WidgetDefinition } from '../types';
import { getWidgetTranslations } from '../widgets/utils';

export const useBoardI18nStrings =
  (): BoardProps.I18nStrings<WidgetDefinition> => {
    const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });
    function createAnnouncement(
      operationAnnouncement: string,
      conflicts: BoardProps.DndReorderState<WidgetDefinition>['conflicts'],
      disturbed: BoardProps.DndReorderState<WidgetDefinition>['disturbed']
    ) {
      const conflictsAnnouncement =
        conflicts.length > 0
          ? t('conflicted_with', {
              items: conflicts
                .map((c) => getWidgetTranslations(c.data).title)
                .join(', '),
            })
          : '';
      const disturbedAnnouncement =
        disturbed.length > 0
          ? t('disturbed_items', { count: disturbed.length })
          : '';

      return [
        operationAnnouncement,
        conflictsAnnouncement,
        disturbedAnnouncement,
      ]
        .filter(Boolean)
        .join(' ');
    }

    return {
      liveAnnouncementDndStarted: (operationType) =>
        operationType === 'resize' ? t('resizing') : t('dragging'),
      liveAnnouncementDndItemReordered: (
        operation: BoardProps.DndReorderState<WidgetDefinition>
      ) => {
        const columns = `column ${operation.placement.x + 1}`;
        const rows = `row ${operation.placement.y + 1}`;

        return createAnnouncement(
          t('item_moved', {
            position: operation.direction === 'horizontal' ? columns : rows,
          }),
          operation.conflicts,
          operation.disturbed
        );
      },
      liveAnnouncementDndItemResized: (operation) => {
        const columnsConstraint = operation.isMinimalColumnsReached
          ? ' (minimal)'
          : '';
        const rowsConstraint = operation.isMinimalRowsReached
          ? ' (minimal)'
          : '';
        const sizeAnnouncement =
          operation.direction === 'horizontal'
            ? `columns ${operation.placement.width}${columnsConstraint}`
            : `rows ${operation.placement.height}${rowsConstraint}`;

        return createAnnouncement(
          t('item_resized', { size: sizeAnnouncement }),
          operation.conflicts,
          operation.disturbed
        );
      },
      liveAnnouncementDndItemInserted: (operation) => {
        const columns = `column ${operation.placement.x + 1}`;
        const rows = `row ${operation.placement.y + 1}`;

        return createAnnouncement(
          t('item_inserted', { position: `${columns}, ${rows}` }),
          operation.conflicts,
          operation.disturbed
        );
      },
      liveAnnouncementDndCommitted: (operationType) =>
        t('dnd_committed', { operation: operationType }),

      liveAnnouncementDndDiscarded: (operationType) =>
        t('dnd_discarded', { operation: operationType }),
      liveAnnouncementItemRemoved: (op) =>
        createAnnouncement(
          t('item_removed', {
            item: getWidgetTranslations(op.item.data).title,
          }),
          [],
          op.disturbed
        ),
      navigationAriaLabel: t('board_navigation_aria_label'),
      navigationAriaDescription: t('board_navigation_aria_description'),
      navigationItemAriaLabel: (item) =>
        item ? getWidgetTranslations(item.data).title : t('empty'),
    };
  };
