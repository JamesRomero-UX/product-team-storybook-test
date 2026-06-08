import { useQuery } from '@apollo/client';
import { GetFormConfigurationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import ControlledSelect from 'src/components/form/controlled-select';
import useEntityInfo from 'src/hooks/getEntityInfo';
import { useAggregation } from 'src/hooks/useAggregation';
import { notEmpty } from 'src/utilityTypes';
import { useFormConfigRegistry } from 'src/utils/table/hooks/form/useFormConfigRegistry';

import { getColumnHeader } from '@/utils/table/hooks/getColumnHeader';
import { convertSchemasToFieldConfigs } from '@/utils/table/utils/customAttributes';

import type { WidgetDataSource } from '../../gigawidget/types';
import {
  getCustomAttributeOptions,
  getDateFieldOptions,
  getStandardFieldOptions,
} from './formHelpers';

type Props<T extends FieldValues, TDataSource extends WidgetDataSource> = {
  dataSource: TDataSource;
  name: Path<T>;
  label: string;
  includeDateValues?: boolean;
  onlyDateFields?: boolean;
  control: Control<T>;
  testId: string;
  addEmptyOption?: boolean;
};

export const CategorySelector = <
  T extends FieldValues,
  TDataSource extends WidgetDataSource,
>({
  dataSource,
  label,
  name,
  includeDateValues,
  onlyDateFields,
  control,
  testId,
  addEmptyOption,
}: Props<T, TDataSource>) => {
  const categoryGetters = dataSource.categoryGetters;
  const { riskModel } = useAggregation();
  const isAggregationsEnabled = riskModel !== 'default';
  const filterOptions = { isAggregationsEnabled };

  const { data } = useQuery(GetFormConfigurationDocument, {
    variables: { where: { ParentType: { _in: dataSource.parentTypes } } },
  });
  const getEntityInfo = useEntityInfo();
  const formRegistry = useFormConfigRegistry();
  const customAttributeOptions = useMemo(() => {
    const fieldConfig = convertSchemasToFieldConfigs({
      customAttributeSchemas:
        data?.form_configuration
          .map((config) => config.customAttributeSchema)
          .filter(notEmpty) ?? [],
      enableRelativeDates: true,
    });

    if (fieldConfig) {
      return Object.entries(fieldConfig).map(([id, config]) => ({
        value: `custom:${id}`,
        label: getColumnHeader(
          {
            formConfigurations: data?.form_configuration ?? null,
            formRegistry,
            getEntityInfo,
          },
          config
        ),
      }));
    }
  }, [data?.form_configuration, formRegistry, getEntityInfo]);

  return (
    <ControlledSelect
      addEmptyOption={addEmptyOption}
      testId={testId}
      placeholder={'Select category'}
      disabled={!categoryGetters}
      options={
        onlyDateFields
          ? [...getDateFieldOptions(categoryGetters, true, filterOptions)]
          : [
              ...getStandardFieldOptions(categoryGetters, filterOptions),
              ...getDateFieldOptions(
                categoryGetters,
                includeDateValues,
                filterOptions
              ),
              ...getCustomAttributeOptions(customAttributeOptions),
            ]
      }
      name={name}
      label={label}
      control={control}
    />
  );
};
