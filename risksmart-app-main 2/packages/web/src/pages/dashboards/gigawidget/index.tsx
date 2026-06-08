import type {
  CategoryType,
  GigawidgetCommonProps,
  WidgetDataSource,
} from './types';
import { GigaBarWidget } from './widget-types/bar/GigaBarWidget';
import type { GigaBarWidgetProps } from './widget-types/bar/GigaBarWidgetProps';
import { GigaLineWidget } from './widget-types/line/GigaLineWidget';
import type { GigaLineWidgetProps } from './widget-types/line/GigaLineWidgetProps';
import type { GigaNumberWidgetProps } from './widget-types/number/GigaNumberWidget';
import { GigaNumberWidget } from './widget-types/number/GigaNumberWidget';
import { GigaPieWidget } from './widget-types/pie/GigaPieWidget';
import type { GigaPieWidgetProps } from './widget-types/pie/GigaPieWidgetProps';
import { PlacematWidget } from './widget-types/placemat/PlacematWidget';
import { GigaRadarWidget } from './widget-types/radar/GigaRadarWidget';
import type { GigaRadarWidgetProps } from './widget-types/radar/GigaRadarWidgetProps';
import type { GigaTableWidgetProps } from './widget-types/table/GigaTableWidget';
import { GigaTableWidget } from './widget-types/table/GigaTableWidget';

type Props<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType | never,
> = GigawidgetCommonProps<TDataSource> &
  (
    | ({
        type: 'bar' | 'stacked-bar';
      } & Omit<
        GigaBarWidgetProps<TDataSource, TCategory, TSubCategory>,
        'stackedBars'
      >)
    | ({ type: 'donut' | 'pie' } & Omit<
        GigaPieWidgetProps<TDataSource, TCategory>,
        'donut'
      >)
    | ({
        type: 'radar';
      } & GigaRadarWidgetProps<TDataSource, TCategory, TSubCategory>)
    | ({
        type: 'line';
      } & GigaLineWidgetProps<TDataSource, TCategory, TSubCategory>)
    | ({
        type: 'kpi';
      } & GigaNumberWidgetProps<TDataSource>)
    | ({
        type: 'placemat' | 'table';
      } & GigaTableWidgetProps<TDataSource>)
  );

export const Gigawidget = <
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
  TSubCategory extends CategoryType | never,
>(
  props: Props<TDataSource, TCategory, TSubCategory>
) => {
  switch (props.type) {
    case 'bar':
    case 'stacked-bar':
      return (
        <GigaBarWidget {...props} stackedBars={props.type === 'stacked-bar'} />
      );
    case 'pie':
    case 'donut':
      return <GigaPieWidget {...props} donut={props.type === 'donut'} />;
    case 'radar':
      return <GigaRadarWidget {...props} />;
    case 'line':
      return <GigaLineWidget {...props} />;
    case 'kpi':
      return <GigaNumberWidget {...props} />;
    case 'table':
      return <GigaTableWidget {...props} />;
    case 'placemat':
      return <PlacematWidget {...props} />;
    default:
      return null;
  }
};
