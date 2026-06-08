import type { UseRatingResponse } from '@risksmart-app/components/src/hooks/useRating';
import type { KeyPrefix } from 'i18next';

import type { UseRiskScoreFormattersResponse } from '@/hooks/useRiskScore';

import type {
  CategoricalGigawidgetCommonProps,
  Category,
  CategoryGetter,
  CategoryType,
  DataSourceItem,
  GigawidgetCommonProps,
  UnratedCategoryType,
  WidgetDataSource,
} from '../../types';

export type GigaRadarWidgetProps<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType,
> = GigawidgetCommonProps<TDataSource> &
  CategoricalGigawidgetCommonProps<TDataSource, TCategory> & {
    subCategoryGetter?: CategoryGetter<TDataSource, TSubCategory>;
    subCategoryRatingTranslationKey?: KeyPrefix<'ratings'>;
    subCategoryOverrideFunction?: (
      category: Category<
        DataSourceItem<TDataSource>,
        TSubCategory | UnratedCategoryType
      >,
      ratingFns: UseRatingResponse,
      riskFormatters: UseRiskScoreFormattersResponse
    ) => Partial<{
      color: string;
      title: string;
      category: Category<
        DataSourceItem<TDataSource>,
        TSubCategory | UnratedCategoryType
      >;
      value: number;
    }>;
  };
