import type {
  ControlElement,
  JsonSchema7,
  VerticalLayout,
} from '@jsonforms/core';
import sheets from '@risksmart-app/data-import/src/sheets';
import type { GetFormConfigurationQuery } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getLogger } from 'src/logger';
import { FormConfigurationRepository } from 'src/repositories/form-configuration/formConfiguration.repository';
import { getHasuraClaims, tenantNameSessionKey } from 'src/requestHelpers';
import { z } from 'zod';

export type CustomAttributeSchemaData =
  GetFormConfigurationQuery['form_configuration'][number]['customAttributeSchema'];

export const getCustomAttributeLabels = (
  customAttributeSchema: CustomAttributeSchemaData
): string[] => {
  if (!customAttributeSchema) {
    return [];
  }
  const labels: string[] = [];
  const jsonSchema: JsonSchema7 = customAttributeSchema?.Schema;
  const layout = customAttributeSchema?.UiSchema as VerticalLayout;
  const controls = layout.elements.filter(
    (e) => e.type === 'Control'
  ) as ControlElement[];
  for (const property in jsonSchema.properties) {
    const control = controls.find((c) => c.scope.endsWith(property));
    if (!control) {
      throw new Error(`No control found for ${property}`);
    }
    const label = control.label as string;
    if (!label) {
      throw new Error(`No label found for control ${property}`);
    }
    labels.push(label);
  }

  return labels;
};

const logger = getLogger();

export const handler = frontendApiHandler(z.any(), async (_, request) => {
  const type = request.queryStringParameters?.['type'];
  logger.appendKeys({ type });
  if (!type) {
    throw new BadRequest(`Missing type query string parameter`);
  }
  if (!(type in sheets)) {
    throw new BadRequest(`Unsupported template type ${type}`);
  }
  const claims = getHasuraClaims(request);

  const formConfigurationRepository = FormConfigurationRepository({
    tenant: claims[tenantNameSessionKey],
    orgKey: claims['x-hasura-org-id'],
    userId: claims['x-hasura-user-id'],
    userRole: claims['x-hasura-default-role'],
  });

  const sheet = sheets[type as keyof typeof sheets];

  if (!sheet) {
    throw new Error(`Unsupported type ${type}`);
  }

  let customAttributeLabels: string[] = [];
  if (sheet.customAttributeType) {
    const { form_configuration } = await formConfigurationRepository.findWhere({
      ParentType: { _eq: sheet.customAttributeType },
    });
    const customAttributeSchema =
      form_configuration?.[0]?.customAttributeSchema;

    customAttributeLabels = getCustomAttributeLabels(customAttributeSchema);
  }
  const defaultLabels: string[] = sheet.fields.map((f) => f.key);

  return {
    statusCode: 200,
    headers: { 'Content-type': 'text/csv' },
    body: defaultLabels
      .concat(customAttributeLabels.map((label) => `"${label}"`))
      .join(','),
  };
});
