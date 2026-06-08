import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getDocumentByIdQueryConfig,
  getDocumentListSimpleQueryConfig,
  getDocumentRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/document.query';

export type DocumentRegisterResponseRow = InferQueryModel<
  'document',
  typeof getDocumentRegisterQueryConfig
>;

export type DocumentByIdResponseRow = InferQueryModel<
  'document',
  typeof getDocumentByIdQueryConfig
>;

export type DocumentListSimpleResponseRow = InferQueryModel<
  'document',
  typeof getDocumentListSimpleQueryConfig
>;
