import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';

import { jiraToRiskHandler } from '../jiraToRisk';
import {
  SkyscannerJiraRiskSchema,
  SkyscannerJiraRiskSchemaWithTransform,
} from './schema';

export const handler = frontendApiHandler(
  SkyscannerJiraRiskSchema,
  async (body, evt) => {
    const parseResult = SkyscannerJiraRiskSchemaWithTransform.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequest(parseResult.error.message);
    }

    return jiraToRiskHandler(
      { body: parseResult.data, secretName: 'skyscanner-jira-config' },
      evt
    );
  }
);
