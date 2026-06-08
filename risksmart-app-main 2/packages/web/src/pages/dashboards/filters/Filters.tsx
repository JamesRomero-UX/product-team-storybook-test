import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import type { TFunction } from 'i18next';
import type { FC } from 'react';
import { useEffect } from 'react';
import type { Control } from 'react-hook-form';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDateRangePicker from 'src/components/form/controlled-date-range-picker';
import DepartmentSelector from 'src/components/form/department-selector';
import TagSelector from 'src/components/form/tag-selector';

import type { DashboardFilterFieldData } from '../forms/dashboardSchema';
import type { DashboardFilter } from '../useDashboardStore';
import { useDashboardStore } from '../useDashboardStore';
import styles from './style.module.scss';

interface FiltersFormProps {
  onChange: (filters: DashboardFilter) => void;
}

interface FilterProps {
  control: Control<DashboardFilterFieldData>;
  filters: DashboardFilter;
}

const getDepartmentFilterPlaceholder = (
  t: TFunction<'common', 'dashboard'>,
  departmentFilters?: Array<string>
) => {
  return departmentFilters && departmentFilters?.length > 0
    ? t('departments_selected', { count: departmentFilters.length })
    : t('filter_by_departments');
};

const getTagFilterPlaceholder = (
  t: TFunction<'common', 'dashboard'>,
  tagFilters?: Array<string>
) => {
  return tagFilters && tagFilters?.length > 0
    ? t('tags_selected', { count: tagFilters.length })
    : t('filter_by_tags');
};

const Filters: FC<FilterProps> = ({ filters }) => {
  const { t } = useTranslation('common', { keyPrefix: 'dashboard' });
  const { control } = useFormContext();

  return (
    <>
      <div
        className={`min-w-full w-full print:hidden ${
          filters.dateRange ? styles.highlightedInput : ''
        }`}
      >
        <ControlledDateRangePicker
          control={control}
          name={'dateRange'}
          label={''}
          placeholder={t('filter_by_date')}
        />
      </div>
      <div
        className={`min-w-full w-full print:hidden ${
          filters.departments.length ? styles.highlightedInput : ''
        }`}
      >
        <DepartmentSelector
          control={control}
          label={''}
          name={'departments'}
          placeholder={getDepartmentFilterPlaceholder(t, filters.departments)}
          hiddenTokens
          disableInfo={true}
        />
      </div>
      <div
        className={`min-w-full w-full print:hidden ${
          filters.tags.length ? styles.highlightedInput : ''
        }`}
      >
        <TagSelector
          control={control}
          label={''}
          name={'tags'}
          placeholder={getTagFilterPlaceholder(t, filters.tags)}
          hideTokens
          disableInfo={true}
        />
      </div>
    </>
  );
};

const FiltersForm: FC<FiltersFormProps> = ({ onChange }) => {
  const { filters } = useDashboardStore();
  const methods = useForm<DashboardFilterFieldData>({
    values: {
      tags: filters.tags.map((t) => ({ TagTypeId: t })),
      departments: filters.departments.map((d) => ({ DepartmentTypeId: d })),
      dateRange: filters.dateRange,
    },
  });

  const { control, watch } = methods;

  useEffect(() => {
    const watchAll = watch((data) => {
      const newFilters: DashboardFilter = {
        tags: data.tags?.map((t) => t?.TagTypeId as string) || [],
        departments:
          data.departments?.map((d) => d?.DepartmentTypeId as string) || [],
        dateRange: data.dateRange as unknown as DateRangePickerProps.Value,
      };
      onChange(newFilters);
    });

    return () => watchAll.unsubscribe();
  }, [watch, onChange]);

  return (
    <FormProvider {...methods}>
      <Filters control={control} filters={filters} />
    </FormProvider>
  );
};

export default FiltersForm;
