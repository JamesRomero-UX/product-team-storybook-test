import type { BoardProps } from '@cloudscape-design/board-components/board';
import Board from '@cloudscape-design/board-components/board';
import type { FC } from 'react';

import type { StoredWidgetDefinition } from '../types';
import EmptyBoard from './EmptyBoard';
import { useBoardI18nStrings } from './useBoardI18nStrings';
import { Widget } from './Widget';

type LayoutBoardProps = {
  items: BoardProps.Item<StoredWidgetDefinition>[];
  onItemsChanged?: (items: BoardProps.Item<StoredWidgetDefinition>[]) => void;
  onAddWidgetClick?: () => void;
};

const LayoutBoard: FC<LayoutBoardProps> = ({
  items,
  onItemsChanged,
  onAddWidgetClick,
}) => {
  const boardI18n = useBoardI18nStrings();

  return (
    <Board
      empty={<EmptyBoard onAddWidgetClick={onAddWidgetClick} />}
      renderItem={(item, actions) => (
        <Widget item={item} onRemove={actions.removeItem} />
      )}
      onItemsChange={(event) => onItemsChanged?.([...event.detail.items])}
      items={items}
      i18nStrings={boardI18n}
    />
  );
};

export default LayoutBoard;
