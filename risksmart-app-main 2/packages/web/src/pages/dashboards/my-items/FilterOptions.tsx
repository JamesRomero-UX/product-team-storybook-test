import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MultiSelect from 'src/components/form/multi-select';

import type { MyItemsFilter } from '../useDashboardStore';
import { defaultMyItemsFilter, useDashboardStore } from '../useDashboardStore';
import styles from './style.module.scss';

const FilterOptions: FC = () => {
  const { myItemsFilters, setMyItemsFilters } = useDashboardStore();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.myItemsDashboard.filters',
  });

  const options: SelectProps.Option[] = useMemo(
    () => [
      {
        label: t('direct'),
        options: [
          {
            label: t('owner'),
            value: 'owner',
          },
          {
            label: t('contributor'),
            value: 'contributor',
          },
          {
            label: t('groupOwner'),
            value: 'groupOwner',
          },
          {
            label: t('groupContributor'),
            value: 'groupContributor',
          },
        ],
      },
      {
        label: t('inherited'),
        options: [
          {
            label: t('owner'),
            value: 'inheritedOwner',
          },
          {
            label: t('contributor'),
            value: 'inheritedContributor',
          },
          {
            label: t('groupOwner'),
            value: 'inheritedGroupOwner',
          },
          {
            label: t('groupContributor'),
            value: 'inheritedGroupContributor',
          },
        ],
      },
    ],
    [t]
  );

  const selectedOptions = useMemo(
    () =>
      Object.entries(myItemsFilters).reduce((acc, [key, value]) => {
        if (value) {
          return [...acc, { value: key }];
        }

        return acc;
      }, [] as SelectProps.Option[]),
    [myItemsFilters]
  );

  return (
    <MultiSelect
      data-testid={'my-items-filter'}
      className={styles.multiselect}
      selectedOptions={selectedOptions}
      onChange={(e) =>
        setMyItemsFilters(
          Object.keys(defaultMyItemsFilter).reduce((acc, key) => {
            const isSelected = e.detail.selectedOptions.some(
              (option) => option.value === key
            );

            return {
              ...acc,
              [key]: isSelected,
            };
          }, {} as MyItemsFilter)
        )
      }
      options={options}
      placeholder={t('placeholder')}
      hideTokens={true}
    />
  );
};

export default FilterOptions;
