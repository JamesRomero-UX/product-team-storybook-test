import type { Readable } from 'node:stream';

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { notEmpty } from '@risksmart-app/shared/typeGuards';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

import type { ParentTypeEnum } from '../../generated/graphql';
import type { CsvFile } from '../sheets';
import sheets from '../sheets';
import type { Field, Sheet } from '../sheets/Sheet';
import type {
  NodeLookup,
  SchemaLookup,
  TParentTypePlus,
} from '../sheets/types';
import { getOptionalEnv } from '../utils/environment';
import { setId } from '../utils/idSetter';
import type { CsvLineErrorType } from '../utils/logging';
import { logIdMapping } from '../utils/logging';
import type {
  KeysWithValuesOfType,
  RisksmartIdLookup,
} from '../utils/lookCreator';
import {
  addExistingIdsToLookup,
  createRisksmartIdLookup,
} from '../utils/lookCreator';
import { parseCsvStream } from './csvReader';
import {
  convertJsonSchemaToZod,
  customAttributeDbFormat,
  customAttributeFields,
} from './customAttributeSchemaValidation';
import { validateAgainstSchema } from './schemaValidation';

export interface ProcessSheetOptions<N extends string, C, G> {
  stream: Readable | undefined;

  sheet: Sheet<N, C, G>;
}

export class SheetsProcessor {
  readonly lookups: { [key in TParentTypePlus]?: RisksmartIdLookup };

  readonly errors: CsvLineErrorType[];

  constructor(
    private nodeLookup: NodeLookup,
    private schemaLookup: SchemaLookup,
    private orgKey: string,
    private client: ApolloClient<NormalizedCacheObject>
  ) {
    this.errors = [];
    this.lookups = {};
    this.createLooksFromExistingNodeData(nodeLookup);
  }

  createLooksFromExistingNodeData(nodeLookup: NodeLookup) {
    for (const id in nodeLookup) {
      const parentType = nodeLookup[id];
      if (!parentType) {
        continue;
      }
      this.lookups[parentType] = this.lookups[parentType] || {};
      const lookup = this.lookups[parentType];
      if (lookup) {
        lookup[id] = id;
      }
    }
  }

  getCsvHeaderLine<N extends string, C, G>(sheet: Sheet<N, C, G>) {
    const sheetWithCustomAttributes =
      this.addCustomAttributeColumnsToSheet(sheet);
    const header = sheetWithCustomAttributes.fields.map((f) => f.key).join(',');

    return header;
  }

  writeCsvSampleFiles(directory: string) {
    Object.values(sheets).forEach((sheet) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.writeCsvSampleFile(sheet as any, directory);
    });
  }

  writeCsvSampleFile<N extends string, C, G>(
    sheet: Sheet<N, C, G>,
    directory: string
  ) {
    const header = this.getCsvHeaderLine(sheet);
    fs.writeFileSync(path.join(directory, sheet.name), header);
  }

  /**
   * Checks if the sheets fields reference any other sheets, and if so, replaces
   * the foreign key ids with the generated primary key guids
   *
   * @param sheet
   * @param records
   */
  setForeignKeys<N extends string, C, G>(sheet: Sheet<N, C, G>, records: C[]) {
    const foreignKeys = sheet.fields
      .filter((f) => f.foreignKey)
      .filter(notEmpty);
    for (const fk of foreignKeys) {
      records.forEach((record, i) => {
        if (record[fk.key as keyof C]) {
          const fkIdLookup = this.lookups[fk.foreignKey!];
          if (!fkIdLookup) {
            throw new Error(
              `Lookup not found for ${fk.foreignKey}. Check for correct import order`
            );
          }
          const error = setId(
            sheet.name as CsvFile,
            fkIdLookup,
            i,
            record,
            fk.key as KeysWithValuesOfType<C, string | null>
          );
          if (error) {
            this.errors.push(error);
          }
        }
      });
    }
    const keyDependantForeignKeys = sheet.fields
      .filter((f) => f.keyDependantForeignKey)
      .filter(notEmpty);
    for (const fk of keyDependantForeignKeys) {
      if (
        !sheet.fields
          .map((f) => f.key)
          .includes(fk.keyDependantForeignKey! as keyof C)
      ) {
        throw new Error(
          `keyDependantForeignKey ${sheet.name} must reference column in same csv file`
        );
      }
      const fkKey = fk.key as keyof C;
      const keyDependantForeignKey = fk.keyDependantForeignKey as keyof C;

      records.forEach((record, i) => {
        const fkValue = record[fkKey];
        const parentTypeValue = record[
          keyDependantForeignKey
        ] as ParentTypeEnum;
        if (fkValue) {
          const fkIdLookup = this.lookups[parentTypeValue];

          if (!fkIdLookup) {
            this.errors.push({
              file: sheet.name,
              row: i + 2,
              message: `Unknown parent type: ${parentTypeValue}`,
            });

            return;
          }

          const error = setId(
            sheet.name as CsvFile,
            fkIdLookup,
            i,
            record,
            fkKey as KeysWithValuesOfType<C, string | null>
          );
          if (error) {
            this.errors.push(error);
          }
        }
      });
    }
  }

  checkUniqueValues<N extends string, C, G>(
    sheet: Sheet<N, C, G>,
    records: C[]
  ) {
    const uniqueFields = sheet.fields.filter((f) => f.unique);
    for (const field of uniqueFields) {
      const distinctValues = new Set();
      records.forEach((record, i) => {
        const value = record[field.key as KeysWithValuesOfType<C, string>];
        if (distinctValues.has(value)) {
          this.errors.push({
            file: sheet.name,
            row: i + 2,
            message: `${
              field.key as string
            } "${value}" already exists in csv file`,
          });
        } else {
          distinctValues.add(value);
        }
      });
    }
    if (sheet.constraints) {
      for (const constraint of sheet.constraints) {
        const distinctValues = new Set();
        records.forEach((record, i) => {
          const value = constraint.fields.map((f) => record[f]).join(',');
          if (distinctValues.has(value)) {
            this.errors.push({
              file: sheet.name,
              row: i + 2,
              message: `${constraint.fields.join(
                ','
              )} "${value}" already exists in csv file`,
            });
          } else {
            distinctValues.add(value);
          }
        });
      }
    }
  }

  /**
   * Checks if sheet has a primary key, and if so, creates a look of generated
   * guids mapped to the id present in the csv file The csv ids are then
   * replaced with the guids
   *
   * @param sheet
   * @param records
   */
  setPrimaryKey<N extends string, C, G>(sheet: Sheet<N, C, G>, records: C[]) {
    const primaryKey = sheet.fields.find((f) => f.isPrimaryKey);
    if (primaryKey) {
      const { lookup, errors } = createRisksmartIdLookup(
        sheet.name as CsvFile,
        records,
        primaryKey.key as KeysWithValuesOfType<C, string>,
        true
      );
      if (errors) {
        this.errors.push(...errors);
      }

      if (!sheet.objectType) {
        throw new Error(`Object type required for primary keys ${sheet.name}`);
      }
      const existingLookup = this.lookups[sheet.objectType];
      if (existingLookup) {
        for (const id in lookup) {
          if (existingLookup[id]) {
            this.errors.push({
              file: sheet.name,
              row: 0,
              message: `Duplicate id found in ${sheet.objectType} lookup: ${id}. This can occur if issue variants have the same id`,
            });
          }
        }

        this.lookups[sheet.objectType] = {
          ...existingLookup,
          ...lookup,
        };
      } else {
        this.lookups[sheet.objectType] = lookup;
      }

      addExistingIdsToLookup(lookup, this.nodeLookup, sheet.objectType);

      records.forEach((record) => {
        const csvId = record[primaryKey.key];
        record[primaryKey.key] = lookup[csvId as string] as C[keyof C];
      });
    }
  }

  addCustomAttributeColumnsToSheet<N extends string, C, G>(
    sheet: Sheet<N, C, G>
  ): Sheet<N, C, G> {
    if (!sheet.customAttributeType) {
      return sheet;
    }
    const customAttributeData =
      this.schemaLookup[sheet.customAttributeType]?.customAttributeSchemaData;
    if (!customAttributeData) {
      return sheet;
    }
    const customAttributeColumns: Field<C>[] =
      customAttributeFields(customAttributeData);

    const sheetWithCustomAttributes: Sheet<N, C, G> = {
      ...sheet,
      fields: [...sheet.fields, ...customAttributeColumns],
    };

    return sheetWithCustomAttributes;
  }

  addCustomFieldSchemaToSheet<N extends string, C, G>(
    sheet: Sheet<N, C, G>
  ): Sheet<N, C, G> {
    if (!sheet.customAttributeType) {
      return sheet;
    }
    const fieldsConfigData =
      this.schemaLookup[sheet.customAttributeType]?.fieldsConfigData;
    if (!fieldsConfigData) {
      return sheet;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemaAsObject = sheet.schema as unknown as z.ZodObject<any>;
    const newShapeEntries: Record<string, z.ZodTypeAny> = {};

    fieldsConfigData
      .filter(
        (fieldConfig) => !fieldConfig.FieldId.startsWith('CustomAttributeData')
      )
      .forEach((fc) => {
        const field = sheet.fields.find(
          (f) => f.fieldConfigFieldId === fc.FieldId
        );

        if (!field) {
          return;
        }

        const fieldSchema = schemaAsObject.shape[field.key as string];

        // Get the innermost schema type to preserve constraints
        const getInnerSchema = (schema: z.ZodTypeAny): z.ZodTypeAny => {
          if (schema instanceof z.ZodNullable) {
            return getInnerSchema(schema.unwrap());
          }
          if (schema instanceof z.ZodOptional) {
            return getInnerSchema(schema.unwrap());
          }

          return schema;
        };

        const isCurrentlyNullable = fieldSchema instanceof z.ZodNullable;
        const isCurrentlyOptional = fieldSchema instanceof z.ZodOptional;
        const isCurrentlyRequired =
          !isCurrentlyNullable && !isCurrentlyOptional;

        if (fc.Required && !isCurrentlyRequired) {
          // Field needs to become required - use the inner schema and add string validation
          const innerSchema = getInnerSchema(fieldSchema);

          // For string fields, ensure empty strings are not allowed when required
          if (innerSchema instanceof z.ZodString) {
            newShapeEntries[field.key as string] = innerSchema.min(
              1,
              'Required'
            );
          } else {
            newShapeEntries[field.key as string] = innerSchema;
          }
        } else if (!fc.Required && isCurrentlyRequired) {
          // Field needs to become optional - make the current schema nullable
          newShapeEntries[field.key as string] = fieldSchema.nullable();
        }
        // If no change needed, don't add to newShapeEntries
      });

    // Only extend the schema if we have changes to make
    if (Object.keys(newShapeEntries).length > 0) {
      sheet.schema = schemaAsObject.extend(
        newShapeEntries
      ) as unknown as z.ZodType<C>;
    }

    return sheet;
  }

  async processSheet<N extends string, C, G>({
    stream,
    sheet,
  }: ProcessSheetOptions<N, C, G>) {
    if (!stream) {
      return [];
    }
    const sheetWithCustomFieldSchema = this.addCustomFieldSchemaToSheet(sheet);

    const sheetWithCustomAttributes = this.addCustomAttributeColumnsToSheet(
      sheetWithCustomFieldSchema
    );

    if (sheet.superRefinement) {
      sheetWithCustomAttributes.schema =
        sheetWithCustomAttributes.schema.superRefine(sheet.superRefinement);
    }

    const { records: csvRecords, errors: csvErrors } = await parseCsvStream(
      stream,
      sheetWithCustomAttributes
    );
    this.errors.push(...csvErrors);

    if (
      csvRecords.length === 0 &&
      csvErrors.length === 0 &&
      getOptionalEnv('ALLOW_EMPTY_CSV') !== 'true'
    ) {
      this.errors.push({
        row: 0,
        message: 'No records found',
        file: sheet.name,
      });
    }

    const customAttributeSchema = this.getCustomAttributeSchema(
      sheet.customAttributeType
    );
    const { records, errors } = await validateAgainstSchema<C>(
      sheetWithCustomAttributes.name as CsvFile,
      csvRecords,
      sheetWithCustomAttributes.schema,
      customAttributeSchema
    );
    this.errors.push(...errors);
    this.checkUniqueValues(sheetWithCustomAttributes, records);
    this.setPrimaryKey(sheetWithCustomAttributes, records);
    this.setForeignKeys(sheetWithCustomAttributes, records);
    const customValidationErrors =
      await sheetWithCustomAttributes.customValidation?.(records, this.client);
    if (customValidationErrors) {
      this.errors.push(...customValidationErrors);
    }

    return this.replaceCustomAttributeLabelsWithKeys(
      sheetWithCustomAttributes.customAttributeType,
      records,
      customAttributeSchema
    );
  }

  replaceCustomAttributeLabelsWithKeys<C>(
    customAttributeType: ParentTypeEnum | undefined,
    records: C[],
    customAttributeSchema: // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      z.ZodObject<{}, 'strip', z.ZodTypeAny, {}, {}> | undefined
  ): C[] {
    if (!customAttributeType) {
      return records;
    }
    if (!customAttributeSchema) {
      return records;
    }
    const labelKeyMapping = customAttributeDbFormat(
      this.schemaLookup[customAttributeType]?.customAttributeSchemaData
    );

    for (const object of records) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customAttributeData = (object as any).CustomAttributeData;
      const mappedCustomAttributeData = Object.keys(customAttributeData).reduce(
        (previous, currentValue) => {
          if (typeof currentValue !== 'string') {
            return previous;
          }
          const label = labelKeyMapping[currentValue];
          if (typeof label !== 'string') {
            return previous;
          }

          return {
            ...previous,
            [label]: customAttributeData[currentValue],
          };
        },
        {}
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (object as any).CustomAttributeData = mappedCustomAttributeData;
    }

    return records;
  }

  async processSheetForInsert<N extends string, C, G>({
    stream,
    sheet,
  }: ProcessSheetOptions<N, C, G>) {
    const records = await this.processSheet({ stream, sheet });

    return records.map((c) => sheet.mapToInsert(c, this.orgKey));
  }
  async processSheetForUpdate<N extends string, C, G>({
    stream,
    sheet,
  }: ProcessSheetOptions<N, C, G>) {
    const records = await this.processSheet({ stream, sheet });

    return records.map((c) => sheet.mapToUpdate?.(c, this.orgKey));
  }

  getCustomAttributeSchema(customAttributeType: ParentTypeEnum | undefined) {
    if (!customAttributeType) {
      return undefined;
    }
    const customAttributeData = customAttributeType
      ? this.schemaLookup[customAttributeType]?.customAttributeSchemaData
      : undefined;

    return customAttributeData
      ? convertJsonSchemaToZod(customAttributeData)
      : undefined;
  }

  async logIdMappings() {
    for (const file in this.lookups) {
      const parentType = file as ParentTypeEnum;
      const lookup = this.lookups[parentType];
      if (!lookup) {
        throw new Error(`Missing lookup for file ${parentType}`);
      }
      logIdMapping(parentType, lookup);
    }
  }
}
