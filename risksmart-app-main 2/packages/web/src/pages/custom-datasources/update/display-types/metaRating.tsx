import SimpleRatingBadge from 'src/components/simple-rating-badge';

import SelectFilter from '../filters/SelectFilter';
import { nullDataChartLabel } from '../nullData';
import type { CellInfo, ReportFieldType } from './types';

const getMetaRating = ({ fieldData, helpers }: CellInfo) => {
  // Scoring settings: use L/I matrix lookup when available
  if (
    helpers.hasScoringSettings &&
    fieldData.meta?.likelihood != null &&
    fieldData.meta?.impact != null
  ) {
    const result = helpers.getRatingByLikelihoodAndImpact(
      Number(fieldData.meta.likelihood),
      Number(fieldData.meta.impact)
    );
    if (result) {
      return { label: result.label, color: result.color };
    }
  }

  // Taxonomy fallback: use backend-provided label + color
  return {
    label: fieldData.value as string,
    color: fieldData.meta?.color as string | undefined,
  };
};

export const metaRating: ReportFieldType = {
  asyncOptionSuggestions: true,
  getChartColor(cellData) {
    if (cellData.fieldDef.displayType !== 'metaRating') {
      throw new Error('metaRating filed type used out of context');
    }

    return getMetaRating(cellData).color;
  },
  exportVal: (cellData) => {
    if (cellData.fieldDef.displayType !== 'metaRating') {
      throw new Error('metaRating filed type used out of context');
    }

    return (getMetaRating(cellData).label ?? '') as string;
  },
  getChartLabel: (cellData) => {
    if (cellData.fieldDef.displayType !== 'metaRating') {
      throw new Error('metaRating filed type used out of context');
    }

    return (getMetaRating(cellData).label ?? nullDataChartLabel()) as string;
  },
  cell: function (cellData) {
    if (cellData.fieldDef.displayType !== 'metaRating') {
      throw new Error('metaRating filed type used out of context');
    }

    const rating = getMetaRating(cellData);

    return (
      <SimpleRatingBadge
        rating={{ color: rating.color, label: rating.label }}
      />
    );
  },
  propertyConfig(field, helpers) {
    // Scoring settings: provide matrix-derived filter options
    if (helpers.hasScoringSettings && helpers.ratingLevelOptions.length > 0) {
      return {
        key: field.key,
        groupValuesLabel: field.groupValuesLabel,
        propertyLabel: field.propertyLabel,
        operators: ['=', '!='].map((operator) => ({
          operator,
          format: (value) => {
            const match = helpers.ratingLevelOptions.find(
              (o) => o.label === value
            );

            return match?.label ?? value;
          },
          form: (props) => {
            return (
              <SelectFilter
                {...props}
                options={helpers.ratingLevelOptions.map((o) => ({
                  value: o.label,
                  label: o.label,
                }))}
              />
            );
          },
        })),
      };
    }

    // Taxonomy fallback: use async option suggestions
    return {
      key: field.key,
      groupValuesLabel: field.groupValuesLabel,
      propertyLabel: field.propertyLabel,
      operators: [
        {
          operator: '=',
        },
      ],
    };
  },
};
