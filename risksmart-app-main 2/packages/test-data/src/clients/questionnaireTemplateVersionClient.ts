import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { questionnaire_template_version } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertQuestionnaireTemplateVersion = async (
  input: InferInsertModel<'questionnaire_template_version'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(questionnaire_template_version)
    .values(input)
    .returning();

  return inserted;
};
