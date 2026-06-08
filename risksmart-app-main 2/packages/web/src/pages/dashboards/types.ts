import type { BoardProps } from '@cloudscape-design/board-components';
import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { SortingState } from '@risksmart-app/components/src/table/tableUtils';
import type { ModuleKey } from '@risksmart-app/modules/src/index';
import type { Risk_Scoring_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ResourceKeys, TFunctionReturn, TOptions } from 'i18next';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { HasPermission } from 'src/rbac/Permission';

import type { TablePreferences, TableRecord } from '@/utils/table/types';

type TranslationKeys = ResourceKeys<true>['common'];
export type WidgetTranslationObject = { title: string; description: string };
type TranslationKeyReturn<T extends string> = TFunctionReturn<
  'common',
  T,
  TOptions
>;

type WidgetTranslationKeyPrefix = {
  [K in TranslationKeys]: TranslationKeyReturn<K> extends WidgetTranslationObject
    ? K
    : never;
}[TranslationKeys];

export type StoredWidgetDefinition = WidgetDefinition & {
  widgetType: string;
};

export type WidgetDefinition = {
  translationKeyPrefix: WidgetTranslationKeyPrefix;
  centerAlignHeader?: boolean;
  content: ForwardRefExoticComponent<RefAttributes<WidgetRef>>;
  disableContentPaddings?: boolean;
  definition: {
    minRowSpan?: number;
    minColumnSpan?: number;
    defaultRowSpan?: number;
    defaultColumnSpan?: number;
  };
  hide?: (
    hasPermission: HasPermission,
    riskModel: Risk_Scoring_Model_Enum,
    isModuleEnabled: (id: ModuleKey) => boolean
  ) => boolean;
  multiple?: boolean;
  settings?: unknown;
  hideTitle?: boolean;
  showOnMyItems?: boolean;
};

export type StoredWidgetPlacement = {
  rowSpan?: number;
  columnSpan?: number;
  columnOffset?: BoardProps.Item['columnOffset'];
  id: string;
  widgetType: string;
  settings?: unknown;
};

export type TableSettings<T extends TableRecord> = {
  query?: PropertyFilterQuery;
  sorting?: SortingState<T>;
  preferences?: TablePreferences<T>;
};

export type WidgetRef = {
  openSettings?: () => void;
  key?: string;
};
