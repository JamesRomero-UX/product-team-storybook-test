import type { KeyPrefix } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type CommonKeys = KeyPrefix<'common'>;

export type Option = { value: string; label: string };

export const useCommonLookupLazy = () => {
  const { t } = useTranslation('common');

  const getOptions = useCallback(
    (i18nKey: CommonKeys): Option[] => {
      const options = i18nKey ? t(i18nKey) : {};

      return Object.keys(options).map((option) => ({
        value: option,
        label: options[option as keyof typeof options],
      }));
    },
    [t]
  );

  const getByValue = useCallback(
    (
      i18nKey: CommonKeys,
      value: null | number | string | undefined
    ): Option | undefined => {
      const options = getOptions(i18nKey);

      return options.find((r) => r.value === String(value));
    },
    [getOptions]
  );

  return {
    getByValue,
    getOptions,
  };
};
