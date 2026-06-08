import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { RatingOption } from 'src/ratings/ratings';

import SelectFilter from '../filters/SelectFilter';
import { nullDataChartLabel } from '../nullData';
import type { CellInfo, Helpers, ReportFieldType } from './types';

const getRating = ({
  fieldData,
  fieldDef,
  helpers,
}: CellInfo): RatingOption | undefined => {
  if (fieldDef.displayType !== 'rating') {
    throw new Error('rating filed type used out of context');
  }

  // Scoring settings: L/I matrix lookup for risk rating keys with L/I meta
  if (
    helpers.hasScoringSettings &&
    fieldData.meta?.likelihood != null &&
    fieldData.meta?.impact != null
  ) {
    const result = helpers.getRatingByLikelihoodAndImpact(
      Number(fieldData.meta.likelihood),
      Number(fieldData.meta.impact)
    );

    return result
      ? { label: result.label, value: result.value, color: result.color }
      : undefined;
  }

  // Scoring settings: value-based lookup for likelihood/impact keys
  if (helpers.hasScoringSettings && fieldDef.ratingKey === 'likelihood') {
    return helpers.getLikelihoodByValue(Number(fieldData.value));
  }
  if (helpers.hasScoringSettings && fieldDef.ratingKey === 'impact') {
    return helpers.getImpactByValue(Number(fieldData.value));
  }

  // Taxonomy fallback: existing i18n value-based lookup
  return helpers.getRatingByValue(
    fieldDef.ratingKey,
    fieldData.value as number | string
  );
};

export const rating: ReportFieldType = {
  getChartColor(cellData) {
    const rating = getRating(cellData);

    return rating?.color;
  },
  getChartLabel(cellData) {
    const rating = getRating(cellData);

    return rating?.label ?? nullDataChartLabel();
  },
  exportVal: (cellData) => {
    const rating = getRating(cellData);

    if (rating === null || rating === undefined) {
      return '';
    }

    return rating.label;
  },
  cell: function (cellData) {
    const rating = getRating(cellData);

    return <SimpleRatingBadge rating={rating} />;
  },
  propertyConfig(fieldDef, helpers: Helpers) {
    if (fieldDef.displayType !== 'rating') {
      throw new Error('rating field type used out of context');
    }

    // Scoring settings: use scoring settings options for likelihood/impact
    if (
      helpers.hasScoringSettings &&
      (fieldDef.ratingKey === 'likelihood' || fieldDef.ratingKey === 'impact')
    ) {
      const options =
        fieldDef.ratingKey === 'likelihood'
          ? helpers.likelihoodOptions
          : helpers.impactOptions;

      return {
        key: fieldDef.key,
        groupValuesLabel: fieldDef.groupValuesLabel,
        propertyLabel: fieldDef.propertyLabel,
        operators: ['=', '!='].map((operator) => ({
          operator,
          format: (value) => {
            const match = options.find(
              (o) => String(o.value) === String(value)
            );

            return match?.label ?? '';
          },
          form: (props) => {
            return (
              <SelectFilter
                {...props}
                options={options.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
              />
            );
          },
        })),
      };
    }

    // Scoring settings: use rating level options for risk rating keys
    if (helpers.hasScoringSettings && helpers.ratingLevelOptions.length > 0) {
      return {
        key: fieldDef.key,
        groupValuesLabel: fieldDef.groupValuesLabel,
        propertyLabel: fieldDef.propertyLabel,
        operators: ['=', '!='].map((operator) => ({
          operator,
          format: (value) => {
            const match = helpers.ratingLevelOptions.find(
              (o) => String(o.value) === String(value)
            );

            return match?.label ?? '';
          },
          form: (props) => {
            return (
              <SelectFilter
                {...props}
                options={helpers.ratingLevelOptions.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
              />
            );
          },
        })),
      };
    }

    // Taxonomy fallback
    return {
      key: fieldDef.key,
      groupValuesLabel: fieldDef.groupValuesLabel,
      propertyLabel: fieldDef.propertyLabel,
      operators: ['=', '!='].map((operator) => ({
        operator,
        format: (value) => {
          const rating = helpers.getRatingByValue(fieldDef.ratingKey, value);

          return rating?.label ?? '';
        },
        form: (props) => {
          return (
            <SelectFilter
              {...props}
              options={helpers
                .getRatingOptions(fieldDef.ratingKey)
                .map((o) => ({
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
