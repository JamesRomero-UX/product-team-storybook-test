import Box from '@risk-smart/themed-cloudscape-components/box';
import { useTranslation } from 'react-i18next';

import BoardItem from '../board-item/BoardItem';
import type { WidgetDefinition } from '../types';

type Props = {
  widget: WidgetDefinition;
  showPreview: boolean;
};

export const WidgetBoardItem = ({ widget, showPreview }: Props) => {
  const { t } = useTranslation(['common']);

  const widgetTranslations = t(widget.translationKeyPrefix, {
    returnObjects: true,
  });

  return (
    <BoardItem
      usePaletteStyle={!showPreview}
      title={widgetTranslations?.title ?? ''}
      headerVariant={'h3'}
    >
      {showPreview ? (
        <widget.content />
      ) : (
        <Box variant={'small'} margin={{ left: 'l' }}>
          {widgetTranslations?.description ?? ''}
        </Box>
      )}
    </BoardItem>
  );
};
