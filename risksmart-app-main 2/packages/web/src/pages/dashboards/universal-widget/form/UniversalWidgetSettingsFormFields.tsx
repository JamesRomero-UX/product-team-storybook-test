import i18n from '@risksmart-app/i18n/src/i18n';
import { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';
import { ControlledSwitch } from 'src/components/form/controlled-switch/ControlledSwitch';
import { FormField } from 'src/components/form/form/FormField';
import { useIsModuleEnabledLazy } from 'src/hooks/useIsModuleEnabled';
import { useHasPermissionLazy } from 'src/rbac/useHasPermissionLazy';

import { useIsFeatureFlagEnabledLazy } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { WidgetDataSource } from '../../gigawidget/types';
import { dataSources } from '../data-sources';
import type { SettingsSchema } from '../settingsSchema';
import { Precision } from '../settingsSchema';
import { chartTypeLabels, datePrecisionLabels } from '../util';
import { CategorySelector } from './CategorySelector';
import { TestIds } from './UniversalWidgetSettingsFormFieldsTestIds';
import { WidgetAggregateField } from './WidgetAggregateField';
import { WidgetPropertyFilter } from './WidgetPropertyFilter';

export const UniversalWidgetSettingsFormFields = () => {
  const { control, watch, setValue } = useFormContext<SettingsSchema>();
  const hasPermission = useHasPermissionLazy();
  const isModuleEnabled = useIsModuleEnabledLazy();
  const isFeatureFlagEnabled = useIsFeatureFlagEnabledLazy();
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const { t } = useTranslation('common', {
    keyPrefix: 'dashboard.widgetSettings.fields',
  });
  const customTitle = watch('customTitle');
  const customUnit = watch('customUnit');
  const selectedDataSource = watch('dataSource') as keyof typeof dataSources;
  const allowOwnershipFiltering = watch('allowOwnershipFiltering');
  const chartType = watch('chartType');
  const aggregationType = watch('aggregationType');
  const categoryGetter = watch('categoryGetter');
  const categoryGetters = (dataSources[selectedDataSource] as WidgetDataSource)
    ?.categoryGetters;
  const chosenCategory = categoryGetters?.find(
    (cg) => cg.id === categoryGetter
  );

  useEffect(() => {
    if (!['bar', 'stacked-bar', 'line', 'radar'].includes(chartType)) {
      setValue('subCategoryGetter', '');
    }
  }, [chartType, setValue]);

  useEffect(() => {
    if (!chosenCategory?.date) {
      setValue('precision', undefined);
    }
  }, [chosenCategory, setValue]);

  const chartTypeOptions = useMemo(() => {
    return Object.keys(chartTypeLabels)
      .map((value) => ({
        value,
        ...chartTypeLabels[value as keyof typeof chartTypeLabels],
      }))
      .filter((option) => {
        // Hide placemat chart type if not in risk data source
        if (option.value === 'placemat') {
          return selectedDataSource === 'risk' && impactsEnabled;
        }

        return true;
      });
  }, [selectedDataSource, impactsEnabled]);

  const dataSourceOptions = useMemo(() => {
    return Object.entries(dataSources)
      .map(([value, ds]) => ({
        value,
        label: i18n.format(i18n.t(ds.entityNamePlural), 'capitalizeAll'),
        hasAccess: ds.hasAccess(
          hasPermission,
          isModuleEnabled,
          isFeatureFlagEnabled
        ),
      }))
      .filter(
        (a) =>
          a.hasAccess &&
          !['myOverdueItems7Days', 'myOverdueItems30Days'].includes(a.value) &&
          !(a.value === 'enterpriseRisk' && allowOwnershipFiltering)
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [
    hasPermission,
    isModuleEnabled,
    isFeatureFlagEnabled,
    allowOwnershipFiltering,
  ]);

  return (
    <div>
      <ControlledSelect
        testId={TestIds.Datasource}
        placeholder={t('dataSourcePlaceholder')}
        options={dataSourceOptions}
        name={'dataSource'}
        label={t('dataSource')}
        control={control}
        disabled={!!dataSources[selectedDataSource]}
      />

      {dataSources[selectedDataSource] ? (
        <>
          <ControlledSelect
            testId={TestIds.ChartType}
            options={chartTypeOptions}
            name={'chartType'}
            label={t('chartType')}
            placeholder={t('chartTypePlaceholder')}
            control={control}
          />

          <Controller
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormField testId={TestIds.Filtering} label={t('filtering')}>
                <WidgetPropertyFilter
                  value={value}
                  onChange={onChange}
                  dataSource={dataSources[selectedDataSource]}
                  dataSourceKey={selectedDataSource}
                  allowOwnershipFiltering={allowOwnershipFiltering}
                />
              </FormField>
            )}
            name={'filtering'}
          />

          {['bar', 'stacked-bar', 'pie', 'donut', 'radar', 'line'].includes(
            chartType
          ) && (
            <CategorySelector
              testId={TestIds.Category}
              dataSource={dataSources[selectedDataSource]}
              name={'categoryGetter'}
              label={t('category')}
              control={control}
              includeDateValues={true}
              onlyDateFields={chartType === 'line'}
            />
          )}

          {chosenCategory?.date ? (
            <ControlledSelect
              placeholder={t('datePrecisionPlaceholder')}
              options={Precision.map((value) => ({
                value,
                label: datePrecisionLabels[value],
              }))}
              testId={'datePrecision'}
              name={'precision'}
              label={t('datePrecision')}
              control={control}
            />
          ) : null}

          {['bar', 'stacked-bar', 'radar', 'line'].includes(chartType) && (
            <CategorySelector
              testId={TestIds.SubCategory}
              dataSource={dataSources[selectedDataSource]}
              name={'subCategoryGetter'}
              label={t('subCategory')}
              control={control}
              addEmptyOption={true}
            />
          )}

          {[
            'bar',
            'stacked-bar',
            'pie',
            'donut',
            'kpi',
            'radar',
            'line',
          ].includes(chartType) && (
            <ControlledSelect
              placeholder={t('aggregateFunctionPlaceholder')}
              testId={TestIds.AggregateFunction}
              options={[
                // TODO: translation
                { value: 'count', label: 'Count' },
                { value: 'sum', label: 'Sum' },
                { value: 'mean', label: 'Mean' },
                { value: 'max', label: 'Max' },
                { value: 'min', label: 'Min' },
              ]}
              name={'aggregationType'}
              label={t('aggregateFunction')}
              control={control}
            />
          )}

          {['sum', 'mean', 'max', 'min'].includes(aggregationType) && (
            <WidgetAggregateField
              testId={TestIds.AggregateField}
              control={control}
              dataSource={dataSources[selectedDataSource]}
              name={'aggregationField'}
              label={t('aggregateField')}
            />
          )}
          {['pie', 'donut'].includes(chartType) && (
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
              name={'showFilters'}
              label={t('showFilters')}
              control={control}
            />
          </div>
          <div className={'mb-4'}>
            <ControlledSwitch
              name={'ignoreDashboardDateFilter'}
              label={t('ignoreDashboardDateFilter')}
              control={control}
            />
          </div>
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
          {chartType === 'kpi' && (
            <>
              <div className={'mb-4'}>
                <ControlledSwitch
                  name={'customUnit'}
                  label={t('customUnit')}
                  control={control}
                />
              </div>
              {customUnit && (
                <ControlledInput
                  control={control}
                  name={'unit'}
                  label={t('customUnit')}
                />
              )}
            </>
          )}
          {['bar', 'stacked-bar'].includes(chartType) && (
            <div className={'mb-4'}>
              <ControlledSwitch
                name={'invertBarChartAxis'}
                label={t('invertBarChartAxis')}
                control={control}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
