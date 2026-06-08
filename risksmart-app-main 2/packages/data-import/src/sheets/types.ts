import type { Readable } from 'node:stream';

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

import type { GetFormConfigurationQuery } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import type { CsvLineErrorType } from '../utils/logging';

export type CustomAttributeSchemaData =
  GetFormConfigurationQuery['form_configuration'][number]['customAttributeSchema'];

export type FieldsConfigData =
  GetFormConfigurationQuery['form_configuration'][number]['fields_config'];

export type SchemaLookup = {
  [parentType in ParentTypeEnum]?: {
    customAttributeSchemaData: CustomAttributeSchemaData;
    fieldsConfigData?: FieldsConfigData;
  };
};

enum AdditionalParentTypes {
  DepartmentType = 'department_type',
  TagType = 'tag_type',
  User = 'user',
  UserGroup = 'userGroup',
}

export type TParentTypePlus = ParentTypeEnum | AdditionalParentTypes;
export const ParentTypePlus = { ...ParentTypeEnum, ...AdditionalParentTypes };

export interface NodeLookup {
  // for node records (and users, tag types and department types). Could potentially add these to the node table to simplify in future.
  [nodeId: string]: TParentTypePlus;
}

export interface ProcessOptions {
  stream: Readable;
  orgKey: string;
  schemaLookup: SchemaLookup;
  nodeLookup: NodeLookup;
  client?: ApolloClient<NormalizedCacheObject>;
}

export type Processor<T> = (options: ProcessOptions) => Promise<{
  records: T[];
  errors: CsvLineErrorType[];
}>;
