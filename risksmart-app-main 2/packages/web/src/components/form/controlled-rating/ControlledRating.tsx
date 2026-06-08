import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';
import RatingSwatch from 'src/components/rating-swatch';
import type { RatingKeys, RatingOption } from 'src/ratings/ratings';
import { useScoringSettings } from 'src/ratings/useScoringSettings';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { OptionWithColor } from '../form-utils';
import { getSelectedOptionFromFormValue } from '../form-utils';
import Select from '../select';
import type { ControlledBaseProps } from '../types';
type SelectOption = SelectProps.Option;
interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  type: RatingKeys;
  filteringType?: SelectProps.FilteringType;
  addEmptyOption?: boolean;
  disabled?: boolean;
  onChange?: (value: null | number) => void;
  testId: string;
  showValue?: boolean;
  ratingContext?: 'standard' | 'internal_audit';
  scoringCategory?: 'likelihood' | 'impact' | 'ratingLevel';
}

export const ControlledRating = <T extends FieldValues>({
  name,
  control,
  type,
  label,
  addEmptyOption,
  onChange,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  testId,
  showValue,
  description,
  ratingContext = 'standard',
  scoringCategory,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  const emptyOption: OptionWithColor = {
    value: '',
    label: '-',
    color: 'light-grey',
  };

  const ratings = useRatingOptions(type, ratingContext, scoringCategory);
  const options = addEmptyOption ? [emptyOption, ...ratings] : ratings;

  if (options?.length === 0 || !options) {
    throw new Error('Rating options missing');
  }

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      defaultValueOptions={options}
      name={name}
      control={control}
      render={({ field: { ref, onChange: onChangeForm, onBlur, value } }) => {
        const selectedOption = getSelectedOptionFromFormValue(
          String(value),
          options
        );

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const rating = useMemo(() => {
          if (!selectedOption) {
            return null;
          }

          return convertSelectOptionToRatingOption(selectedOption);
        }, [selectedOption]);

        return (
          <FormField
            label={label}
            errorText={error?.message}
            stretch
            testId={testId}
            guidance={description}
          >
            <div>
              <div className={'flex'}>
                <div className={'flex-1'}>
                  <Select
                    ref={ref}
                    selectedOption={selectedOption}
                    onBlur={onBlur}
                    onChange={(e) => {
                      const value = e.detail.selectedOption.value;
                      const nullableValue = value == '' ? null : Number(value);
                      onChangeForm(nullableValue);
                      onChange?.(nullableValue);
                    }}
                    options={options}
                    // TODO: translation
                    placeholder={'Select'}
                    // TODO: translation
                    empty={'No matches found'}
                    {...props}
                    disabled={readOnly || props.disabled}
                  />
                </div>
                <div className={'grow-0 pl-4'}>
                  <RatingSwatch rating={rating} showValue={showValue} />
                </div>
              </div>
            </div>
          </FormField>
        );
      }}
    />
  );
};

function convertRatingOptionToSelectOption(option: RatingOption): SelectOption {
  return {
    ...option,
    value: String(option.value),
  };
}

function convertSelectOptionToRatingOption(
  option: SelectOption & { color?: string }
): RatingOption {
  if (option.label === undefined) {
    throw new Error('Option must have a label');
  }
  if (option.value === undefined) {
    throw new Error('Option must have a value');
  }

  return {
    label: option.label,
    value: Number(option.value),
    color: option.color,
  };
}

const scoringCategoryMap = {
  likelihood: 'likelihoodOptions',
  impact: 'impactOptions',
  ratingLevel: 'ratingLevelOptions',
} as const;

/**
 * Returns the appropriate rating options for a dropdown.
 *
 * Risk-score fields (likelihood, impact, ratingLevel) use scoring settings
 * when available, falling back to taxonomy. All other rating fields (e.g.
 * assessment_status, risk_appetite) always use taxonomy.
 */
function useRatingOptions(
  taxonomyKey: RatingKeys,
  ratingContext: 'standard' | 'internal_audit',
  scoringCategory?: 'likelihood' | 'impact' | 'ratingLevel'
): SelectOption[] {
  const taxonomy = useRating(taxonomyKey, ratingContext);
  const scoring = useScoringSettings();

  if (scoringCategory) {
    const scoringOptions = scoring.hasScoringSettings
      ? scoring[scoringCategoryMap[scoringCategory]]
      : taxonomy.options;

    return scoringOptions.map(convertRatingOptionToSelectOption);
  }

  return taxonomy.options.map(convertRatingOptionToSelectOption);
}
