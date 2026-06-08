import type {
  GetFormCustomisationQuery,
  GetReportingDataQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ReportField } from 'src/pages/dashboards/custom-data-source-widget/widget-chart/types';
import { useFeatures } from 'src/rbac/useFeatures';

import type { TypedCustomDatasource } from '../types';
import { CustomDatasourceModel } from '../update/customDatasourceModel';
import { displayTypes } from '../update/display-types';
import type { CustomAttributeSchemaLookup } from '../update/types';
import { useCustomDatasourceHelpers } from '../useCustomDatasourceHelpers';

export const useCustomDatasourceExporterMapper = ({
  customDatasource,
  customAttributeSchemaLookup,
  formFieldConfigurations,
}: {
  customDatasource:
    | null
    | Pick<TypedCustomDatasource, 'Datasources' | 'Fields'>
    | undefined;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup | null | undefined;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
}) => {
  const helpers = useCustomDatasourceHelpers();
  const enabledFeatures = useFeatures();

  return (results: GetReportingDataQuery['reportingData']) => {
    if (!customDatasource) {
      throw new Error('Missing custom data source');
    }
    if (!customAttributeSchemaLookup) {
      throw new Error('Missing custom attribute schema');
    }
    const customDatasourceModel = CustomDatasourceModel(
      customDatasource,
      customAttributeSchemaLookup,
      formFieldConfigurations,
      enabledFeatures
    );
    const fields = customDatasourceModel.fields;

    const headers = fields.map((f) => f.label ?? f.defaultLabel);
    const dataAndHeaders = [
      headers,
      ...(results?.map((r) =>
        r.map((f, i) => {
          const fieldDef = fields[i];
          const displayType = displayTypes[fieldDef.displayType];
          const formatter = displayType.exportVal;
          const label =
            formatter({
              fieldData: f as ReportField,
              fieldDef,
              helpers,
              groupByDatePrecision: null,
            }) ?? '';

          return label;
        })
      ) ?? []),
    ];

    return dataAndHeaders;
  };
};
