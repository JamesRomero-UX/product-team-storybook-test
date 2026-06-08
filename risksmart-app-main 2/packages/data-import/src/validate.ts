import type { Readable } from 'node:stream';

import type { VariablesOf } from '@graphql-typed-document-node/core';
import fs from 'fs';
import path from 'path';

import type {
  InsertAllDocument,
  UpdateAllDocument,
} from '../generated/graphql';
import { getClient } from './graphqlClient';
import { createNodeLookupByOrgKey } from './services/nodeService';
import { createSchemaLookupByOrgKey } from './services/schemaService';
import type { CsvFile } from './sheets';
import { csvFiles } from './sheets';
import type { CsvLineErrorType } from './utils/logging';
import { logCsvLineError } from './utils/logging';
import { validateAllFilesPresent } from './validateAllFilesPresent';
import { processStreamsForInsert, processStreamsForUpdate } from './validation';

const createStreamMap = (directory: string) => {
  const streams: { [name in CsvFile]?: Readable } = {};
  for (const file of csvFiles) {
    streams[file as CsvFile] = fs.createReadStream(path.join(directory, file));
  }

  return streams;
};

export const validate = async (
  directory: string,
  orgKey: string
): Promise<{
  result: VariablesOf<typeof InsertAllDocument>;
  errors: CsvLineErrorType[];
}> => {
  validateAllFilesPresent(directory);
  console.log('Validating files');
  console.time('Validation time');

  const schemaLookup = await createSchemaLookupByOrgKey(orgKey);
  const nodeLookup = await createNodeLookupByOrgKey(orgKey);

  const result = await processStreamsForInsert(
    createStreamMap(directory),
    orgKey,
    schemaLookup,
    nodeLookup,
    getClient()
  );
  console.timeEnd('Validation time');
  result.errors.map(logCsvLineError);

  return result;
};

export const validateUpdate = async (
  directory: string,
  orgKey: string
): Promise<{
  result: VariablesOf<typeof UpdateAllDocument>;
  errors: CsvLineErrorType[];
}> => {
  validateAllFilesPresent(directory);
  console.log('Validating files');
  console.time('Validation time');

  const schemaLookup = await createSchemaLookupByOrgKey(orgKey);
  const nodeLookup = await createNodeLookupByOrgKey(orgKey);
  const result = await processStreamsForUpdate(
    createStreamMap(directory),
    orgKey,
    schemaLookup,
    nodeLookup,
    getClient()
  );
  console.timeEnd('Validation time');

  return result;
};
