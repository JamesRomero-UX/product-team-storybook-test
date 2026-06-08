import { getCustomAttributeLabels } from '@risksmart-app/data-import/src/tools/exportUtils';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Unauthorized } from 'http-errors';
import _ from 'lodash';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
const logger = getLogger();

/**
 * This is the API handler to process ASOS data queries.
 */
export const handler = async (evt: APIGatewayProxyEventV2) => {
  if (!evt.headers.authorization) {
    throw new Unauthorized('Invalid authorization credentials in request');
  }
  logger.info('Starting ASOS data query');

  const claims = getHasuraClaims(evt);
  const userId = getUserIdFromClaims(evt);
  const tenantName = getTenantNameFromClaims(evt);

  const client = getBackendRestApiClient({
    tenant: tenantName,
    orgKey: claims['x-hasura-org-id'],
    userId,
    userRole: claims['x-hasura-default-role'],
  });

  logger.info('Retrieving ASOS data', { userId, tenantName });
  const data = await client.getAsosData();

  const customAttributes = _.mapValues(
    _.keyBy(data.form_configuration, 'ParentType'),
    (f) => f.customAttributeSchema
  );
  const customAttributeLabels = _.mapValues(customAttributes, (f) =>
    getCustomAttributeLabels(f)
  );

  logger.info('Parsing data with custom attributes');

  const processedData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'form_configuration')
      .map(([key, value]) => {
        return [
          key,
          addCustomAttributesAndRemoveTypeNames(value, customAttributeLabels),
        ];
      })
  );

  logger.info('Completed ASOS data query');

  return {
    statusCode: 200,
    body: JSON.stringify({
      processedData,
    }),
  };
};

// Helper function to recursively remove __typename from an object and map custom attribute data
function addCustomAttributesAndRemoveTypeNames(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  customAttributeLabels: {
    [x: string]: {
      [key: string]: string;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      addCustomAttributesAndRemoveTypeNames(item, customAttributeLabels)
    );
  } else if (obj !== null && typeof obj === 'object') {
    let type = obj.__typename;
    if (type && type === 'risk_assessment_result') {
      if (obj['ControlType'] === 'Uncontrolled') {
        type = 'uncontrolled_risk_assessment_result';
      } else {
        type = 'controlled_risk_assessment_result';
      }
    }
    for (const key in obj) {
      if (key === 'CustomAttributeData' && customAttributeLabels[type]) {
        // Map each custom attribute to its label
        const customAttributeLabelsForType = customAttributeLabels[type];
        _.each(customAttributeLabelsForType, (cl, ck) => {
          // Use a prefix for custom attributes to avoid collisions with existing columns
          obj[`CA_${cl}`] = obj['CustomAttributeData']?.[ck];
        });
      } else if (typeof obj[key] === 'object') {
        obj[key] = addCustomAttributesAndRemoveTypeNames(
          obj[key],
          customAttributeLabels
        );
      }
    }
    // Remove the irrelevant fields
    delete obj.CustomAttributeData;
    delete obj.__typename;
  }

  return obj;
}
