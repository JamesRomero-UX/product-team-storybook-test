import type {
  BoardProps,
  ItemsPaletteProps,
} from '@cloudscape-design/board-components';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { ModuleKey } from '@risksmart-app/modules/src/index';
import { Risk_Scoring_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef } from 'react';
import type { HasPermission } from 'src/rbac/Permission';
import { v4 as uuidv4 } from 'uuid';

import type {
  StoredWidgetDefinition,
  WidgetDefinition,
  WidgetRef,
  WidgetTranslationObject,
} from '../types';
import { UniversalWidget } from '../universal-widget/UniversalWidget';

type WidgetId = keyof Record<string, WidgetDefinition>;

type WidgetFilterOptions = {
  widgets: Record<string, WidgetDefinition>;
  hasPermission: HasPermission;
  riskModel: Risk_Scoring_Model_Enum;
  isModuleEnabled: (id: ModuleKey) => boolean;
};

type GetPaletteItemsOptions = WidgetFilterOptions & {
  items: BoardProps.Item<StoredWidgetDefinition>[];
};

type FilterWidgetsByUserPermissionsOptions<T extends { widgetType: WidgetId }> =
  WidgetFilterOptions & {
    widgetsToFilter: T[];
  };

type HasPermissionToViewWidgetOptions = Pick<
  GetPaletteItemsOptions,
  'hasPermission' | 'riskModel' | 'isModuleEnabled'
> & {
  widget: WidgetDefinition;
};

type CreateWidgetDefinition = Omit<WidgetDefinition, 'content'> & {
  content?: ForwardRefRenderFunction<WidgetRef>;
};

export const getWidgetTranslations = (widget: WidgetDefinition) => {
  return i18n.t(widget.translationKeyPrefix, {
    returnObjects: true,
  }) as WidgetTranslationObject;
};

export const defaultWidgetOptions = {
  table: {
    centerAlignHeader: true,
    disableContentPaddings: true,
    definition: {
      defaultRowSpan: 5,
      defaultColumnSpan: 4,
    },
    showOnMyItems: true,
  },
  chart: {
    definition: {
      defaultRowSpan: 4,
      defaultColumnSpan: 2,
    },
    showOnMyItems: true,
  },
  statistic: {
    centerAlignHeader: true,
    definition: {
      defaultRowSpan: 2,
      defaultColumnSpan: 1,
    },
    showOnMyItems: true,
  },
  richText: {
    definition: {
      defaultRowSpan: 1,
      defaultColumnSpan: 5,
    },
    showOnMyItems: true,
  },
} satisfies Record<string, Partial<WidgetDefinition>>;

const hasPermissionToViewWidget = ({
  widget,
  hasPermission,
  riskModel,
  isModuleEnabled,
}: HasPermissionToViewWidgetOptions) => {
  return !widget.hide?.(hasPermission, riskModel, isModuleEnabled);
};

export const createWidget = (
  definition: CreateWidgetDefinition
): WidgetDefinition => ({
  ...definition,
  content: forwardRef<WidgetRef>(definition.content ?? UniversalWidget),
  multiple: true,
});

export const getPaletteItems = ({
  widgets,
  items,
  hasPermission,
  riskModel,
  isModuleEnabled,
}: GetPaletteItemsOptions): ItemsPaletteProps.Item<StoredWidgetDefinition>[] => {
  return Object.keys(widgets)
    .filter(
      (widgetType: string) =>
        !items.find((i) => i.data.widgetType === widgetType) ||
        widgets[widgetType].multiple
    )
    .filter((widgetType) =>
      hasPermissionToViewWidget({
        widget: widgets[widgetType],
        hasPermission,
        riskModel,
        isModuleEnabled,
      })
    )
    .map((widgetType) => ({
      id: uuidv4(),
      data: { widgetType, ...widgets[widgetType] },
      definition: widgets[widgetType].definition,
    }));
};

export const filterWidgetsByUserPermissions = <
  T extends { widgetType: WidgetId },
>({
  widgets,
  widgetsToFilter,
  hasPermission,
  riskModel,
  isModuleEnabled,
}: FilterWidgetsByUserPermissionsOptions<T>): T[] =>
  widgetsToFilter.filter(({ widgetType }) =>
    widgets[widgetType]
      ? hasPermissionToViewWidget({
          widget: widgets[widgetType],
          hasPermission,
          riskModel,
          isModuleEnabled,
        })
      : false
  );

export const riskModelSupportedByHeatmap = (
  riskModel: Risk_Scoring_Model_Enum
) => {
  return (
    riskModel === Risk_Scoring_Model_Enum.Default ||
    riskModel === Risk_Scoring_Model_Enum.TypedControlEffectivenessAverages
  );
};
