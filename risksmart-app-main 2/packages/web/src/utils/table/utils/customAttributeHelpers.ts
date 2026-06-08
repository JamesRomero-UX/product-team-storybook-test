import type {
  AltValueOption,
  FormFieldOption,
} from '@risksmart-app/form-configuration/src/types';

import type { JSONObject } from '@/types/types';
import { EMPTY_VALUE } from '@/utils/collectionUtils';
import { isString, isStringArray } from '@/utils/utils';

export const matchToField = (
  data: JSONObject | null,
  path: string,
  AltValueOptions?: AltValueOption[]
): string => {
  const key = data?.[path];

  if (key && isString(key)) {
    return mapKeyToValue(key, AltValueOptions) || EMPTY_VALUE;
  }

  if (key && isStringArray(key)) {
    return mapKeysToValues(key, AltValueOptions).join(',');
  }

  return EMPTY_VALUE;
};

export const matchToArrayField = (
  data: JSONObject | null,
  path: string,
  AltValueOptions?: AltValueOption[]
): string[] => {
  const key = data ? (data[path] as string[]) || [] : [];

  return mapKeysToValues(key, AltValueOptions);
};

const mapKeysToValues = (
  key: string[],
  AltValueOptions?: AltValueOption[]
): string[] => {
  if (!AltValueOptions || AltValueOptions.length === 0) {
    return key;
  }

  return (
    key
      .map((k) => mapKeyToValue(k, AltValueOptions))
      .filter((v) => v !== null) ?? []
  );
};

const mapKeyToValue = (
  key: string | null,
  AltValueOptions?: AltValueOption[]
): string | null => {
  if (!key || !AltValueOptions || AltValueOptions.length === 0) {
    return key;
  }

  const match = AltValueOptions.find((option) => option.AltValue === key);

  return match ? match.Value : key;
};

/**
 * If provided with formFieldOptions will return a list of alternative value options depending on the useAlternativeValues flag.
 *
 * @param formFieldOptions - A list of form field options.
 * @param useAlternativeValues - A flag indicating whether to use alternative values.
 * @returns A list of alternative value options.
 */
export const resolveDisplayValues = (props: {
  formFieldOptions: FormFieldOption[] | undefined;
  useAlternativeValues: boolean;
}): AltValueOption[] => {
  // this is a bit confusing because when an alternate value is provided, the human readable value is not persisted against the entity
  // therefore the human readable value is technically the alternate value.
  // This is in contrast to the label and altLabel fields as the altLabel is NOT the human readable field.
  return props.useAlternativeValues
    ? []
    : (props.formFieldOptions?.filter((p) => p._tag === 'AltValueOption') ??
        []);
};
