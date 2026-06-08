import {
  flattenJSON,
  getCustomAttributeLabels,
} from '@risksmart-app/data-import/src/tools/exportUtils';
import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import _ from 'lodash';

/**
 * Processes raw export data by extracting CustomAttributeData fields
 * into top-level CA_-prefixed columns for each entity.
 *
 * This strips `__typename` from the result and optionally `form_configuration`.
 * CustomAttributeData is flattened using labels from form_configuration.
 *
 * @param data - Raw export data from getNormalisedExportData GraphQL query
 * @param excludeFormConfiguration - Whether to exclude form_configuration from result (default: false)
 * @returns Processed data with flattened custom attributes (shape similar to input but with CA_ columns)
 */
export const processCustomAttributes = (
  data: GetNormalisedExportDataQuery,
  excludeFormConfiguration = false
) => {
  const customAttributes = _.mapValues(
    _.keyBy(data.form_configuration, 'ParentType'),
    (f) => f.customAttributeSchema
  );
  const customAttributeLabels = _.mapValues(customAttributes, (f) =>
    getCustomAttributeLabels(f)
  );

  const processedEntries = Object.entries(data)
    .filter(([key]) => key !== '__typename' && key !== 'form_configuration')
    .map(([key, value]) => {
      if (!Array.isArray(value)) {
        return [key, value];
      }

      const processedItems = value.map((item) =>
        flattenJSON(item, {}, '', customAttributeLabels[key])
      );

      return [key, processedItems];
    });

  // Add form_configuration back if not excluded
  if (!excludeFormConfiguration) {
    processedEntries.push(['form_configuration', data.form_configuration]);
  }

  return Object.fromEntries(processedEntries);
};
