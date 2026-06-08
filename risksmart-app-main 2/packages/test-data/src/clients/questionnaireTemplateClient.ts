import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { questionnaire_template } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertQuestionnaireTemplate = async (
  input: InferInsertModel<'questionnaire_template'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(questionnaire_template)
    .values(input)
    .returning();

  return inserted;
};
