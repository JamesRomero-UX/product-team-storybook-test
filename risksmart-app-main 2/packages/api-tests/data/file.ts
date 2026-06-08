import { randomUUID } from 'crypto';

import { getDefaultOrgId } from '../clients/defaults';
import type { FileInsertInput } from '../generated/graphql';
import { anotherUser } from '../initialData';

const defaultFile: FileInsertInput = {
  FileName: 'list.pdf',
  ContentType: 'txt',
  FileSize: 23,
  ModifiedAtTimestamp: undefined,
  ModifiedByUser: anotherUser.Id,
  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};

export const buildFile = (
  overrides: Partial<FileInsertInput> = {}
): FileInsertInput => {
  return {
    ...defaultFile,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
