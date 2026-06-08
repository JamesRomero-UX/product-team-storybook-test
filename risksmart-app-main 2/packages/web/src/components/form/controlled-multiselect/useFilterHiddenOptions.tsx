import { useMemo } from 'react';

import type { HidableOption, HidableOptionGroup } from './types';

/**
 * Recursively filter out options where the field hidden is set to true.
 * NOTE: This is a temporary workaround to filter out drop down options whilst still seeing the labels
 * in the tokens section. This hook can be completely removed if the initial value set on the component already has a label
 * @param options
 * @returns
 */
const useFilterHiddenOptions = (
  options: readonly HidableOption[] | undefined
) => {
  return useMemo(() => {
    const recursiveHiddenFilter = (options: HidableOption[]) => {
      const filtered: HidableOption[] = [];
      for (const option of options) {
        if (!option.hidden) {
          const filteredOption = { ...option };
          if ('options' in option) {
            (filteredOption as HidableOptionGroup).options =
              recursiveHiddenFilter((option as HidableOptionGroup).options);
          }
          filtered.push(filteredOption);
        }
      }

      return filtered;
    };

    return recursiveHiddenFilter(options as HidableOption[]);
  }, [options]);
};

export default useFilterHiddenOptions;
