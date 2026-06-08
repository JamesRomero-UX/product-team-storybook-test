import i18n from '@risksmart-app/i18n/src/i18n';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import SelectFilter from '../filters/SelectFilter';
import { nullDataChartLabel } from '../nullData';
import type { Helpers, ReportFieldType } from './types';

const getIssueVariantNameLookup = (
  helpers: Helpers
): { [issueType: string]: string } =>
  Object.entries(IssueTypeMapping)
    .filter(
      ([, value]) =>
        !value.featureFlag || helpers.isFeatureFlagEnabled(value.featureFlag)
    )
    .reduce((previous, current) => {
      return {
        ...previous,
        [current[0]]: i18n.format(i18n.t(current[1].entityLabel), 'capitalize'),
      };
    }, {});

const getIssueVariantText = (value: string, helpers: Helpers): string => {
  const issueVariantNameLookup = getIssueVariantNameLookup(helpers);

  return issueVariantNameLookup[value];
};

export const issueVariantName: ReportFieldType = {
  getChartLabel(cellData) {
    const text = getIssueVariantText(
      cellData.fieldData.value as string,
      cellData.helpers
    );

    return text ?? nullDataChartLabel();
  },
  exportVal: (cellData) => {
    const text = getIssueVariantText(
      cellData.fieldData.value as string,
      cellData.helpers
    );

    return text ?? '';
  },
  cell: (cellData) => {
    const text = getIssueVariantText(
      cellData.fieldData.value as string,
      cellData.helpers
    );

    return text ?? '';
  },
  propertyConfig(fieldDef, helpers) {
    if (fieldDef.displayType !== 'issueVariantName') {
      throw new Error('issueVariantName filed type used out of context');
    }

    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      operators: ['=', '!='].map((operator) => ({
        operator: operator,
        format: (value) => getIssueVariantText(value, helpers) ?? '',
        form: (props) => {
          return (
            <SelectFilter
              {...props}
              options={Object.entries(getIssueVariantNameLookup(helpers))
                .map((o) => ({
                  value: o[0],
                  label: o[1],
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
            />
          );
        },
      })),
    };
  },
};
