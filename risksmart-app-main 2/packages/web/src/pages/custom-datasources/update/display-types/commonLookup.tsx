import SelectFilter from '../filters/SelectFilter';
import { nullDataChartLabel } from '../nullData';
import type { CellInfo, ReportFieldType } from './types';

const getText = ({
  fieldData,
  fieldDef,
  helpers,
}: CellInfo): string | undefined => {
  if (fieldDef.displayType !== 'commonLookup') {
    throw new Error('commonLookup filed type used out of context');
  }

  return helpers.getCommonLookupByValue(
    fieldDef.i18nKey,
    fieldData.value as number | string
  )?.label;
};

/**
 * Represents a Select field where the options are retrieved from the i18n common lookup.
 */
export const commonLookup: ReportFieldType = {
  getChartLabel(cellData) {
    const text = getText(cellData);

    return text ?? nullDataChartLabel();
  },
  exportVal: (cellData) => {
    const text = getText(cellData);

    return text ?? '';
  },
  cell: (cellData) => {
    const text = getText(cellData);

    return text ?? '';
  },
  propertyConfig(fieldDef, { getCommonLookupByValue, getCommonLookupOptions }) {
    if (fieldDef.displayType !== 'commonLookup') {
      throw new Error('commonLookup filed type used out of context');
    }

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      operators: ['=', '!='].map((operator) => ({
        operator: operator,
        format: (value) => {
          const rating = getCommonLookupByValue(fieldDef.i18nKey, value);

          return rating?.label ?? '';
        },
        form: (props) => {
          return (
            <SelectFilter
              {...props}
              options={getCommonLookupOptions(fieldDef.i18nKey).map((o) => ({
                value: (o.value as unknown as string) ?? undefined,
                label: o.label,
              }))}
            />
          );
        },
      })),
    };
  },
};
