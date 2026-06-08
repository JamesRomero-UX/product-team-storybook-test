import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { z } from 'zod';

import type { ParentTypeEnum } from '../../generated/graphql';
import type { CsvLineErrorType } from '../utils/logging';
import type { TParentTypePlus } from './types';

export type FieldType = 'string' | 'number' | 'boolean' | 'date';

export interface Field<CsvType> {
  key: keyof CsvType;
  type: FieldType;
  /** The ID of the form field for customised schemas */
  fieldConfigFieldId?: string;
  isPrimaryKey?: boolean;
  /** Field references another csv file or table */
  foreignKey?: TParentTypePlus;
  /** Field references another file/table based on specified column */
  keyDependantForeignKey?: keyof CsvType;
  /** If all values within the csv file for this key most be different */
  unique?: boolean;
}

export interface CsvParseDefinition<Name extends string, CsvType> {
  name: Name;
  fields: Field<CsvType>[];
}

export type Sheet<
  Name extends string,
  CsvType,
  GraphqlInsertType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  GraphqlUpdateType = any,
> = {
  /**
   * Required to check fk values with those existing in the risksmart.node table
   */
  objectType?: TParentTypePlus;
  /**
   * The enum value that references the custom schema. Generally this is the
   * same as objectType with the exception of a few edge cases
   */
  customAttributeType?: ParentTypeEnum;
  name: Name;

  schema: z.ZodType<CsvType>;
  superRefinement?: z.SuperRefinement<CsvType>;
  constraints?: [
    {
      type: 'unique';
      fields: (keyof CsvType)[];
    },
  ];

  /**
   * Generate mock csv records
   *
   * @returns
   */
  generateMockData: () => CsvType[];

  mapToInsert: (c: CsvType, orgKey: string) => GraphqlInsertType;
  mapToUpdate?: (c: CsvType, orgKey: string) => GraphqlUpdateType;

  /**
   * Any additional validation
   *
   * @returns
   */
  customValidation?: (
    records: CsvType[],
    client: ApolloClient<NormalizedCacheObject>
  ) => Promise<CsvLineErrorType[]>;
} & CsvParseDefinition<Name, CsvType>;
