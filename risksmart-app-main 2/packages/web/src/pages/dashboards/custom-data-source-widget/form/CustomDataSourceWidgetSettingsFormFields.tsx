import { useQuery } from '@apollo/client';
import type { AggregateType } from '@risksmart-app/shared/reporting/schema';
import {
  GetAllFormsCustomisationDocument,
  GetCustomDatasourcesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';
import { ControlledSwitch } from 'src/components/form/controlled-switch/ControlledSwitch';
import type { TypedCustomDatasource } from 'src/pages/custom-datasources/types';
import { CustomDatasourceModel } from 'src/pages/custom-datasources/update/customDatasourceModel';
import { useFeatures } from 'src/rbac/useFeatures';

import { useCustomAttributeLookup } from '../useCustomAttributeLookup';
import { getAggregateTypeOptions } from './aggregationTypeOptions';
import { getChartTypeConfig, getChartTypeOptions } from './chartTypesOptions';
import type { ChartType } from './customDataSourceWidgetSettingsSchema';
import { type CustomDataSourceWidgetSettings } from './customDataSourceWidgetSettingsSchema';
import { datePrecisionOptions } from './datePrecisionOptions';

export const CustomDataSourceWidgetSettingsFormFields = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'dashboard.widgetSettings.fields',
  });
  const enabledFeatures = useFeatures();
  const { customAttributeSchemaLookup } = useCustomAttributeLookup();
  const { data: formCustomisationData } = useQuery(
    GetAllFormsCustomisationDocument,
    {}
  );
  const { control, watch, setValue } =
    useFormContext<CustomDataSourceWidgetSettings>();
  const customTitle = watch('customTitle');
  const chartType = watch('chartType');
  const x1FieldId = watch('x1FieldId');
  const yFieldId = watch('yFieldId');
  const chartTypeConfig = getChartTypeConfig();
  const customDataSourceId = watch('customDataSourceId');
  const aggregationType = watch('aggregationType');
  const { data: customDatasourceResponse, loading } = useQuery(
    GetCustomDatasourcesDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const customDatasources: TypedCustomDatasource[] =
    customDatasourceResponse?.custom_datasource ?? [];
  const selectedCustomDatasource = customDatasources.find(
    (cd) => cd.Id === customDataSourceId
  );

  if (!customAttributeSchemaLookup) {
    return <div></div>;
  }

  const customDatasourceModel = selectedCustomDatasource
    ? CustomDatasourceModel(
        selectedCustomDatasource,
        customAttributeSchemaLookup,
        formCustomisationData?.form_field_configuration ?? null,
        enabledFeatures
      )
    : null;

  const x1FieldDefinition = x1FieldId
    ? customDatasourceModel?.getFieldByUniqueId(x1FieldId)
    : null;

  return (
    <div>
      <ControlledSelect
        placeholder={t('dataSourcePlaceholder')}
        addEmptyOption={true}
        options={customDatasources.map((cd) => ({
          value: cd.Id,
          label: cd.Title,
        }))}
        onChange={() => {
          setValue('x1FieldId', null);
          setValue('x2FieldId', null);
          setValue('yFieldId', null);
          setValue('aggregationType', null);
          setValue('yFieldId', null);
        }}
        statusType={loading ? 'loading' : 'finished'}
        testId={'dataSource'}
        name={'customDataSourceId'}
        label={t('dataSource')}
        control={control}
      />
      <ControlledSelect
        onChange={(value) => {
          const chartConfig = value && chartTypeConfig[value as ChartType];
          if (!chartConfig || !chartConfig.category) {
            setValue('x1FieldId', null);
          }
          if (!chartConfig || !chartConfig.subCategory) {
            setValue('x2FieldId', null);
          }
          if (!chartConfig || !chartConfig.aggregation) {
            setValue('aggregationType', null);
            setValue('yFieldId', null);
          }
        }}
        testId={'chartType'}
        addEmptyOption={true}
        placeholder={t('chartTypePlaceholder')}
        options={getChartTypeOptions()}
        name={'chartType'}
        label={t('chartType')}
        control={control}
      />
      {selectedCustomDatasource && customDatasourceModel && chartType && (
        <>
          {chartTypeConfig[chartType].category && (
            <>
              <ControlledSelect
                placeholder={t('categoryPlaceholder')}
                addEmptyOption={true}
                onChange={(value) => {
                  const x1FieldDefinition = value
                    ? customDatasourceModel?.getFieldByUniqueId(value as string)
                    : null;
                  if (x1FieldDefinition?.dataType !== 'date') {
                    setValue('x1FieldDatePrecision', null);
                  }
                }}
                testId={'category'}
                options={customDatasourceModel.fields.map((o) => ({
                  ...o,
                  label: o.label ?? o.defaultLabel,
                }))}
                name={'x1FieldId'}
                label={t('category')}
                control={control}
              />
              {x1FieldDefinition && x1FieldDefinition.dataType === 'date' && (
                <ControlledSelect
                  placeholder={t('datePrecisionPlaceholder')}
                  addEmptyOption={true}
                  testId={'datePrecision'}
                  options={datePrecisionOptions}
                  name={'x1FieldDatePrecision'}
                  label={t('datePrecision')}
                  control={control}
                />
              )}
              {chartTypeConfig[chartType].subCategory && (
                <ControlledSelect
                  placeholder={t('subCategoryPlaceholder')}
                  addEmptyOption={true}
                  testId={'subCategory'}
                  options={customDatasourceModel.fields.map((o) => ({
                    ...o,
                    label: o.label ?? o.defaultLabel,
                  }))}
                  name={'x2FieldId'}
                  label={t('subCategory')}
                  control={control}
                />
              )}
            </>
          )}

          {chartTypeConfig[chartType].aggregation && (
            <ControlledSelect
              addEmptyOption={true}
              testId={'aggregationType'}
              placeholder={t('aggregateFunctionPlaceholder')}
              options={getAggregateTypeOptions()}
              name={'aggregationType'}
              label={t('aggregateFunction')}
              control={control}
              onChange={(aggregationType) => {
                if (aggregationType) {
                  const newYFields = customDatasourceModel.getChartYFields(
                    aggregationType as AggregateType
                  );
                  const yFieldAllowed = newYFields.find(
                    (y) => y.value === yFieldId
                  );
                  if (!yFieldAllowed) {
                    setValue('yFieldId', null);
                  }
                } else {
                  setValue('yFieldId', null);
                }
              }}
            />
          )}
          {aggregationType && (
            <ControlledSelect
              placeholder={t('aggregateFieldPlaceholder')}
              addEmptyOption={true}
              options={customDatasourceModel.getChartYFields(aggregationType)}
              testId={'aggregateField'}
              name={'yFieldId'}
              label={t('aggregateField')}
              control={control}
            />
          )}
        </>
      )}
      {(chartType === 'pie' || chartType === 'donut') && (
        <div className={'mb-4'}>
          <ControlledSwitch
            name={'showAsPercentage'}
            label={t('showAsPercentage')}
            control={control}
          />
        </div>
      )}
      <div className={'mb-4'}>
        <ControlledSwitch
          name={'customTitle'}
          label={t('customTitle')}
          control={control}
        />
      </div>
      {customTitle && (
        <ControlledInput
          control={control}
          name={'title'}
          label={t('customTitle')}
        />
      )}
    </div>
  );
};
