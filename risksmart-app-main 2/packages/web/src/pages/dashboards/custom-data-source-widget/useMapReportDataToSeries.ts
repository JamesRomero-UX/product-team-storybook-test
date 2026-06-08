import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import type { GroupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';
import type { FieldDefinition } from '@risksmart-app/shared/reporting/datasets/types';
import { aggregateTypesNotSupportingLabels } from '@risksmart-app/shared/reporting/dataTypes';
import type { AggregateType } from '@risksmart-app/shared/reporting/schema';
import _ from 'lodash';
import { useColourPalette } from 'src/hooks/useColourPalette';
import { displayTypes } from 'src/pages/custom-datasources/update/display-types';
import { nullDataChartLabel } from 'src/pages/custom-datasources/update/nullData';
import { useCustomDatasourceHelpers } from 'src/pages/custom-datasources/useCustomDatasourceHelpers';

import type {
  ReportField,
  ReportRawDataType,
  Series,
} from './widget-chart/types';

export type Options = {
  aggregationType: AggregateType | null;
  x1FieldDefinition: FieldDefinition | null;
  x1GroupByDatePrecision: GroupByDatePrecision | null;
  x2FieldDefinition: FieldDefinition | null;
  x2GroupByDatePrecision: GroupByDatePrecision | null;
  reportingData: ReportField[][];
  aggregateFieldDefinition: FieldDefinition | null;
};

/**
 * Converts raw report data into series data as used by charts.
 * It removes entries with null values
 * adds colours and labels to data points
 * sorts data by x-axis
 * converts x values to Date objects for date based fields
 * @param param0
 * @returns
 */
export const useMapReportDataToSeries = ({
  aggregationType,
  x1FieldDefinition,
  x1GroupByDatePrecision,
  x2FieldDefinition,
  x2GroupByDatePrecision,
  reportingData,
  aggregateFieldDefinition,
}: Options): Series[] => {
  const helpers = useCustomDatasourceHelpers();
  const { genericCategoricalPalette } = useColourPalette();

  if (!x1FieldDefinition) {
    const aggregateFieldConfig = aggregateFieldDefinition
      ? displayTypes[aggregateFieldDefinition.displayType]
      : null;

    const fieldData: ReportField | undefined = reportingData?.[0]?.[0];

    const parseFieldValue = (fieldDataValue: ReportRawDataType) => {
      if (!_.isString(fieldDataValue)) {
        return fieldDataValue;
      }

      const num = parseFloat(fieldDataValue);

      if (_.isNaN(num)) {
        return fieldDataValue;
      }

      const decimalIndex = fieldDataValue.indexOf('.');

      if (decimalIndex !== -1 && fieldDataValue.length - decimalIndex - 1 > 2) {
        return num.toFixed(2);
      }

      return fieldDataValue;
    };

    const fieldValue = parseFieldValue(fieldData?.value);

    const valueString = _.isNil(fieldData)
      ? ''
      : _.isNil(fieldValue)
        ? nullDataChartLabel()
        : String(fieldValue);

    const label =
      fieldData &&
      aggregationType &&
      !aggregateTypesNotSupportingLabels.includes(aggregationType)
        ? (aggregateFieldConfig?.getChartLabel({
            fieldData,
            fieldDef: aggregateFieldDefinition!,
            helpers,
            groupByDatePrecision: null,
          }) ?? valueString)
        : fieldData
          ? valueString
          : '';

    return [
      {
        title: '',
        data: [
          {
            x: null,
            y: fieldData?.value,
            label,
          },
        ],
      },
    ];
  }

  const x1FieldConfig = displayTypes[x1FieldDefinition.displayType];
  const x2FieldConfig = x2FieldDefinition
    ? displayTypes[x2FieldDefinition.displayType]
    : null;
  const seriesData = (
    reportingData?.map((d) =>
      d.length === 2
        ? { x1: d[0].value, y: d[1].value, sourceX1: d[0] }
        : {
            x1: d[0].value,
            sourceX1: d[0],
            x2: d[1].value,
            sourceX2: d[1],
            y: d[2].value,
          }
    ) ?? []
  ).map((d) => {
    const ratingColour = x1FieldConfig.getChartColor?.({
      fieldData: d.sourceX1,
      fieldDef: x1FieldDefinition,
      helpers,
      groupByDatePrecision: x1GroupByDatePrecision,
    });
    const color = ratingColour
      ? getColorStyles(ratingColour).backgroundColor
      : undefined;
    const label = x1FieldConfig.getChartLabel({
      fieldData: d.sourceX1,
      fieldDef: x1FieldDefinition,
      helpers,
      groupByDatePrecision: x1GroupByDatePrecision,
    });

    return {
      ...d,
      x1: d.x1,
      x2: d.x2,
      label,
      color,
    };
  });

  if (x2FieldDefinition) {
    const groupings = _.groupBy(seriesData, 'x2');

    return Object.keys(groupings).map((x2, i) => {
      const sourceX2 = groupings[x2][0].sourceX2!;
      const label = x2FieldConfig?.getChartLabel?.({
        fieldData: sourceX2,
        fieldDef: x2FieldDefinition,
        helpers,
        groupByDatePrecision: x2GroupByDatePrecision,
      });
      const ratingColour = x2FieldConfig?.getChartColor?.({
        fieldData: sourceX2,
        fieldDef: x2FieldDefinition,
        helpers,
        groupByDatePrecision: x2GroupByDatePrecision,
      });
      const color = ratingColour
        ? getColorStyles(ratingColour).backgroundColor
        : undefined;

      const title = label;

      return {
        title: String(title),
        color: color ?? genericCategoricalPalette(i),
        hasSubcategory: true,
        data: groupings[x2].map((sd) => ({
          x: sd.x1,
          y: sd.y,
          color: sd.color,
          label: sd.label,
        })),
      };
    });
  } else {
    return [
      {
        title: '',
        data: seriesData.map((sd) => ({
          x: sd.x1,
          y: sd.y,
          label: sd.label,
          color: sd.color,
        })),
      },
    ];
  }
};
