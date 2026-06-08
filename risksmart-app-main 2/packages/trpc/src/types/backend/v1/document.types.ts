import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getDocumentListQueryConfig } from '@risksmart-app/drizzle/src/queries/document.query';

import type { DocumentByIdResponseRow } from '../../document.types';
import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type DocumentListResponseRow = InferQueryModel<
  'document',
  typeof getDocumentListQueryConfig
>;

export interface DocumentByIdResponse {
  document: DocumentByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
