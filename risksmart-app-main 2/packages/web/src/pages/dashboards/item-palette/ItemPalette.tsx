import type { ItemsPaletteProps } from '@cloudscape-design/board-components';
import { ItemsPalette } from '@cloudscape-design/board-components';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import TextFilter from '@risk-smart/themed-cloudscape-components/text-filter';
import { type FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { WidgetDefinition } from '../types';
import EmptyPalette from './EmptyPalette';
import { WidgetBoardItem } from './WidgetBoardItem';

type ItemPaletteProps = {
  items: ItemsPaletteProps.Item<WidgetDefinition>[];
};

const ItemPalette: FC<ItemPaletteProps> = ({ items }) => {
  const { t } = useTranslation(['common']);
  const [filteringText, setFilteringText] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const { title, description } = t(item.data.translationKeyPrefix);

      return (
        title.toLowerCase().includes(filteringText) ||
        description.toLowerCase().includes(filteringText)
      );
    });
  }, [items, filteringText, t]);

  return (
    <SpaceBetween size={'l'}>
      {items.length === 0 && <EmptyPalette />}
      <TextFilter
        filteringText={filteringText}
        filteringPlaceholder={t('dashboard.widget_filter_placeholder')}
        filteringAriaLabel={t('dashboard.widget_filter_placeholder')}
        onChange={({ detail }) => setFilteringText(detail.filteringText)}
      />
      <ItemsPalette
        items={filteredItems}
        renderItem={(item, context) => (
          <WidgetBoardItem
            widget={item.data}
            showPreview={context.showPreview}
          />
        )}
        i18nStrings={{
          liveAnnouncementDndStarted: t(
            'dashboard.live_announcement_dnd_started'
          ),
          liveAnnouncementDndDiscarded: t(
            'dashboard.live_announcement_dnd_discarded'
          ),
          navigationAriaLabel: t('dashboard.palette_navigation_aria_label'),
          navigationAriaDescription: t(
            'dashboard.palette_navigation_aria_description'
          ),
          navigationItemAriaLabel: (item) =>
            t(item.data.translationKeyPrefix, { returnObjects: true })?.title ??
            '',
        }}
      />
    </SpaceBetween>
  );
};

export default ItemPalette;
