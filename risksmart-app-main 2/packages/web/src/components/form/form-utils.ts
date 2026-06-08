import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { Colour } from '@risksmart-app/components/src/utils/colours';

export type OptionWithColor = SelectProps.Option & { color: Colour };

export const getSelectedOptionFromFormValue = (
  value: string,
  options: SelectProps.Option[]
) => {
  return (
    options?.find((option) => 'value' in option && option.value === value) ||
    null
  );
};

// Taken from article "Merge JavaScript Objects in an Array with Different Defined Properties"
// https://www.paigeniedringhaus.com/blog/merge-java-script-objects-in-an-array-with-different-defined-properties#mergeobject
export const mergeFormValues = <V>(
  A: Record<string, unknown>,
  B?: Record<string, unknown>
): V => {
  if (!B) {
    return A as V;
  }
  const res: Record<string, unknown> = {};
  Object.keys({ ...A, ...B }).map((key) => {
    res[key] = B[key] || A[key];
  });

  return res as V;
};

export const getSelectedOptions = (
  selectedOptions: readonly SelectProps.Option[],
  options: (SelectProps.Option | SelectProps.OptionGroup)[]
): SelectProps.Option[] => {
  const selectedOptionDefinitions: MultiselectProps.Option[] = [];
  for (const option of options) {
    if ('value' in option) {
      if (selectedOptions?.find((so) => so.value === option.value)) {
        selectedOptionDefinitions?.push(option);
        continue;
      }
    }
    if ('options' in option) {
      for (const childOption of option.options) {
        if ('value' in childOption) {
          if (selectedOptions?.find((so) => so.value === childOption.value)) {
            selectedOptionDefinitions?.push(childOption);
            continue;
          }
        }
      }
    }
  }

  return selectedOptionDefinitions;
};

export const sortByLabel = (a: { label: string }, b: { label: string }) => {
  const labelA = a.label.toLowerCase();
  const labelB = b.label.toLowerCase();

  return labelA > labelB ? 1 : labelA < labelB ? -1 : 0;
};
