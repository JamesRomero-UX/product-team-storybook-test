import { useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import type {
  GroupBy,
  ReportingDataInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAllFormsCustomisationDocument,
  GetCustomDatasourceByIdDocument,
  GetReportingDataDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { Ref } from 'react';
import { useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import type { TypedCustomDatasource } from 'src/pages/custom-datasources/types';
import { CustomDatasourceModel } from 'src/pages/custom-datasources/update/customDatasourceModel';
import { getFieldFromUniqueId } from 'src/pages/custom-datasources/update/fieldValue';
import { useFeatures } from 'src/rbac/useFeatures';

import { customDatasourceUrl } from '@/utils/urls';

import type { WidgetRef } from '../types';
import ConfigureWidgetPanel from '../universal-widget/ConfigureWidgetPanel';
import { getFilterPropertyForCategory } from './categoryClickHandler';
import { CustomDataSourceWidgetSettingsModel } from './CustomDataSourceWidgetSettingsModel';
import {
  type CustomDataSourceWidgetSettings,
  customDataSourceWidgetSettingsSchema,
} from './form/customDataSourceWidgetSettingsSchema';
import { useCustomAttributeLookup } from './useCustomAttributeLookup';
import { useMapReportDataToSeries } from './useMapReportDataToSeries';
import type { ReportField } from './widget-chart/types';
import { WidgetChart } from './widget-chart/WidgetChart';

export const CustomDataSourceWidget = (
  _props: unknown,
  ref: Ref<WidgetRef>
) => {
  const navigate = useNavigate();
  const { customAttributeSchemaLookup } = useCustomAttributeLookup();

  const { data: formCustomisationData } = useQuery(
    GetAllFormsCustomisationDocument,
    {}
  );
  const { t } = useTranslation(['common'], { keyPrefix: 'customDatasources' });
  const { t: tt } = useTranslation(['common']);
  const [settings, setSettings] =
    useDashboardWidgetSettings<CustomDataSourceWidgetSettings>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  useImperativeHandle(
    ref,
    (): WidgetRef => ({
      openSettings: () => {
        setShowSettingsModal(true);
      },
    })
  );
  const { success: validSettings } =
    customDataSourceWidgetSettingsSchema.safeParse(settings);

  const { data: customDatasourceResponse, loading: loadingCustomDatasource } =
    useQuery(GetCustomDatasourceByIdDocument, {
      variables: settings?.customDataSourceId
        ? {
            Id: settings?.customDataSourceId,
          }
        : undefined,
      skip: !settings?.customDataSourceId,
      fetchPolicy: 'no-cache',
    });
  const selectedCustomDatasource: TypedCustomDatasource | undefined =
    customDatasourceResponse?.custom_datasource_by_pk ?? undefined;

  // Clear table preferences when datasource changes to ensure fresh column ordering
  useEffect(() => {
    if (selectedCustomDatasource && settings?.tablePreferences) {
      // Check if the current tablePreferences are compatible with the current datasource
      const currentFieldIds = selectedCustomDatasource.Fields?.map((field) =>
        getFieldFromUniqueId(`${field.dataSourceIndex}|${field.fieldId}`)
      );

      const preferenceFieldIds = settings.tablePreferences.contentDisplay?.map(
        (item) => getFieldFromUniqueId(item.id)
      );

      // If field structures don't match, clear preferences to force refresh
      const fieldsMatch =
        currentFieldIds?.length === preferenceFieldIds?.length &&
        currentFieldIds?.every((field) => {
          return preferenceFieldIds?.some(
            (prefField) =>
              prefField &&
              field.fieldId === prefField.fieldId &&
              field.dataSourceIndex === prefField.dataSourceIndex
          );
        });

      if (!fieldsMatch) {
        setSettings({ ...settings, tablePreferences: undefined });
      }
    }
  }, [selectedCustomDatasource, settings, setSettings]);

  const getFieldByValue = (value: string) => {
    const field = getFieldFromUniqueId(value);

    return selectedCustomDatasource?.Fields?.find(
      (f) =>
        f.fieldId === field.fieldId &&
        f.dataSourceIndex === field.dataSourceIndex
    );
  };

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = settings?.chartType === 'table' ? 20 : 100000;
  const x1Field = getFieldByValue(settings?.x1FieldId ?? '');
  const x2Field = getFieldByValue(settings?.x2FieldId ?? '');
  const aggregateField = getFieldByValue(settings?.yFieldId ?? '');
  const groupBy: GroupBy[] = [];
  if (settings?.aggregationType) {
    if (x1Field) {
      groupBy.push({
        field: {
          fieldId: x1Field.fieldId,
          dataSourceIndex: x1Field.dataSourceIndex,
        },
        datePrecision: settings.x1FieldDatePrecision,
      });
    }
    if (x2Field) {
      groupBy.push({
        field: {
          fieldId: x2Field.fieldId,
          dataSourceIndex: x2Field.dataSourceIndex,
        },
      });
    }
  }

  const reportDataDefinition: ReportingDataInput | undefined =
    selectedCustomDatasource
      ? {
          dataSources: selectedCustomDatasource.Datasources,
          limit: pageSize,
          filters: selectedCustomDatasource.Filters,
          fields: settings?.aggregationType
            ? []
            : (selectedCustomDatasource?.Fields ?? []),
          groupBy,
          offset: pageIndex * pageSize,
          aggregateType: settings?.aggregationType,
          aggregateField: aggregateField
            ? {
                fieldId: aggregateField.fieldId,
                dataSourceIndex: aggregateField.dataSourceIndex,
              }
            : undefined,
        }
      : undefined;

  const { data, loading, error } = useQuery(GetReportingDataDocument, {
    variables: reportDataDefinition
      ? { Input: reportDataDefinition }
      : undefined,
    skip: !validSettings || !reportDataDefinition,
    fetchPolicy: 'no-cache',
  });
  const enabledFeatures = useFeatures();
  const customDatasourceModel =
    selectedCustomDatasource && customAttributeSchemaLookup
      ? CustomDatasourceModel(
          selectedCustomDatasource,
          customAttributeSchemaLookup,
          formCustomisationData?.form_field_configuration ?? null,
          enabledFeatures
        )
      : null;

  const aggregateFieldDefinition = aggregateField
    ? (customDatasourceModel?.getField(
        aggregateField.dataSourceIndex,
        aggregateField.fieldId
      ) ?? null)
    : null;

  const x1FieldDefinition = x1Field
    ? (customDatasourceModel?.getField(
        x1Field.dataSourceIndex,
        x1Field.fieldId
      ) ?? null)
    : null;

  const x2FieldDefinition = x2Field
    ? (customDatasourceModel?.getField(
        x2Field.dataSourceIndex,
        x2Field.fieldId
      ) ?? null)
    : null;

  const xAxisDataType: DataType = x1FieldDefinition?.dataType ?? 'text';
  const seriesData = useMapReportDataToSeries({
    aggregationType: settings?.aggregationType ?? null,
    x1FieldDefinition,
    x2FieldDefinition,
    reportingData: (data?.reportingData as ReportField[][]) ?? [],
    x1GroupByDatePrecision: settings?.x1FieldDatePrecision ?? null,
    // Don't currently support date precision on x2
    x2GroupByDatePrecision: null,
    aggregateFieldDefinition,
  });

  const total = _.sumBy(
    seriesData.flatMap((s) => s.data),
    (val) => val.y as number
  );

  return (
    <div className={'h-full flex flex-col gap-2'}>
      {showSettingsModal && (
        <CustomDataSourceWidgetSettingsModel
          onDismiss={() => setShowSettingsModal(false)}
          onSave={async (data) => {
            const title = data.customTitle
              ? data.title
              : tt('dashboard.widgets.customDataSourceWidget.title');
            setSettings({ ...data, title });
          }}
        />
      )}
      {!validSettings ? (
        <ConfigureWidgetPanel
          onConfigureClick={() => setShowSettingsModal(true)}
        />
      ) : (
        <>
          {!reportDataDefinition && !loadingCustomDatasource && (
            <Alert header={'Error'} type={'warning'}>
              {t('datasource_not_found_message')}
            </Alert>
          )}
        </>
      )}

      {error && (
        <Alert header={'Error'} type={'error'}>
          {t('data_request_failure_message')}
        </Alert>
      )}

      {!error &&
        validSettings &&
        settings &&
        customAttributeSchemaLookup &&
        selectedCustomDatasource && (
          <WidgetChart
            key={`${selectedCustomDatasource.Id}-${settings.chartType}`}
            customAttributeSchemaLookup={customAttributeSchemaLookup}
            formFieldConfigurations={
              formCustomisationData?.form_field_configuration ?? null
            }
            customDatasource={selectedCustomDatasource}
            onPageChangeClick={(e) => {
              setPageIndex(e.requestedPageIndex);
            }}
            onCategoryClick={({ value }) => {
              if (selectedCustomDatasource && x1Field && x1FieldDefinition) {
                navigate(
                  customDatasourceUrl(selectedCustomDatasource.Id, {
                    filtering: getFilterPropertyForCategory({
                      x1Field,
                      value,
                      x1FieldDatePrecision: settings.x1FieldDatePrecision,
                      x1FieldType: x1FieldDefinition?.dataType,
                    }),
                  })
                );
              }
            }}
            reportData={(data?.reportingData as ReportField[][]) ?? []}
            chartType={settings.chartType}
            seriesData={seriesData}
            pageSize={pageSize}
            currentPageIndex={pageIndex}
            loading={loading}
            xAxisDataType={xAxisDataType}
            xAxisDatePrecision={settings.x1FieldDatePrecision ?? null}
            innerMetricValue={total?.toString()}
            tablePreferences={settings.tablePreferences}
            onTablePreferencesChange={(preferences) => {
              setSettings({ ...settings, tablePreferences: preferences });
            }}
            showAsPercentage={settings.showAsPercentage}
          />
        )}
    </div>
  );
};

CustomDataSourceWidget.displayName = 'CustomDataSourceWidget';
