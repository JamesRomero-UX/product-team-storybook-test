import { Readable } from 'node:stream';

import { ApolloClient, InMemoryCache, NetworkStatus } from '@apollo/client';
import { validate as isValidUUID } from 'uuid';
import { vi } from 'vitest';
import { z } from 'zod';

import { ParentTypeEnum } from '../../generated/graphql';
import { getUserByEmail } from '../graphqlClient';
import actionParents from '../sheets/actionParents';
import causes from '../sheets/cause';
import { issue as issues } from '../sheets/issue';
import type { CustomAttributeSchemaData, NodeLookup } from '../sheets/types';
import users from '../sheets/users';
import { SheetsProcessor } from './sheetProcessor';

vi.mock('../graphqlClient');

const getUserByEmailMocked = vi.mocked(getUserByEmail);

describe('Sheet processor', () => {
  const apolloClient = () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'ignore',
        },
        query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        },
      },
    });

  describe('processSheetForInsert', () => {
    it('maps to insert object', async () => {
      const customAttributeSchemaData: CustomAttributeSchemaData = {
        Id: '123',
        Schema: {
          properties: {
            '1702983795778_select': {
              enum: ['b', 'c', 'd', 'e', 'f'],
              type: 'string',
            },
          },
        },
        UiSchema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              label: 'Select Label',
              scope: '#/properties/1702983795778_select',
            },
          ],
        },
      };

      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised,Select Label
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z,b`,
      ]);

      const nodeLookup: NodeLookup = { issueId1: ParentTypeEnum.Issue };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {
          [ParentTypeEnum.Issue]: { customAttributeSchemaData },
        },
        'org1',
        apolloClient()
      );
      const results = await sheetProcess.processSheetForInsert({
        stream: issueStream,
        sheet: issues,
      });

      expect(sheetProcess.errors.length).toEqual(0);
      expect(results).toEqual([
        {
          Id: expect.any(String),
          Title: 'issue title',
          Details: 'issue description',
          ImpactsCustomer: true,
          IsExternalIssue: true,
          DateOccurred: '2023-11-24T21:29:27.734Z',
          DateIdentified: '2024-09-26T17:03:53.522Z',
          RaisedAtTimestamp: '2024-03-18T23:05:44.916Z',
          Meta: null,
          OrgKey: 'org1',
          CreatedAtTimestamp: undefined,
          ModifiedAtTimestamp: undefined,
          CreatedByUser: 'SYSTEM',
          ModifiedByUser: 'SYSTEM',
          CustomAttributeData: { '1702983795778_select': 'b' },
          Type: 'issue',
        },
      ]);
    });
  });

  describe('processSheet', () => {
    it('should error if csv contains no records', async () => {
      const stream = Readable.from([
        `id,title,description,significance,parentIssueId`,
      ]);

      const sheetProcess = new SheetsProcessor({}, {}, 'org1', apolloClient());
      await sheetProcess.processSheet({ stream, sheet: causes });

      expect(sheetProcess.errors).toEqual([
        { file: 'causes.csv', message: 'No records found', row: 0 },
      ]);
    });

    it('should throw an error processing a sheet before a dependant sheet has been processed', async () => {
      const stream = Readable.from([
        `id,title,description,significance,parentIssueId
  1,title 1,description 1,1,issueId1`,
      ]);

      const sheetProcess = new SheetsProcessor({}, {}, 'org1', apolloClient());

      await expect(
        sheetProcess.processSheet({ stream, sheet: causes })
      ).rejects.toThrow(
        'Lookup not found for issue. Check for correct import order'
      );
    });

    it('should add an error if there are duplicate primary key values', async () => {
      getUserByEmailMocked.mockResolvedValue({
        data: { user: [] },
        loading: false,
        networkStatus: NetworkStatus.ready,
      });

      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z`,
      ]);

      const sheetProcess = new SheetsProcessor({}, {}, 'org1', apolloClient());

      await sheetProcess.processSheet({
        stream: issueStream,
        sheet: issues,
      });
      expect(sheetProcess.errors).toEqual([
        {
          file: 'issue.csv',
          message: 'Duplicate id - 1',
          row: 3,
        },
      ]);
    });

    it('should add an error if there a duplicate user emails', async () => {
      const userStream = Readable.from([
        `id,userName,firstName,lastName,email
1,Julius Reichert,Mose,Cormier,Mose.Cormier@risksmart.com
2,Julius Reichert,Mose,Cormier,Mose.Cormier@risksmart.com`,
      ]);

      const sheetProcess = new SheetsProcessor({}, {}, 'org1', apolloClient());

      await sheetProcess.processSheet({
        stream: userStream,
        sheet: users,
      });
      expect(sheetProcess.errors).toEqual([
        {
          file: 'users.csv',
          message:
            'email "Mose.Cormier@risksmart.com" already exists in csv file',
          row: 3,
        },
      ]);
    });

    it('should replace primary key values with a guid', async () => {
      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z`,
      ]);

      const sheetProcess = new SheetsProcessor({}, {}, 'org1', apolloClient());

      const results = await sheetProcess.processSheet({
        stream: issueStream,
        sheet: issues,
      });
      expect(sheetProcess.errors.length).toEqual(0);
      expect(results.length).toEqual(1);
      expect(isValidUUID(results[0].id)).toEqual(true);
    });

    it('should add an error when referencing a fk id that does not exist', async () => {
      const causeStream = Readable.from([
        `id,title,description,significance,parentIssueId
  1,title 1,description 1,1,issueId1`,
      ]);
      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z`,
      ]);

      const sheetProcess = new SheetsProcessor({}, {}, 'org1', apolloClient());
      await sheetProcess.processSheet({ stream: issueStream, sheet: issues });

      await sheetProcess.processSheet({
        stream: causeStream,
        sheet: causes,
      });
      expect(sheetProcess.errors).toEqual([
        {
          file: 'causes.csv',
          message: 'Referenced key parentIssueId value issueId1 not found',
          row: 2,
        },
      ]);
    });

    it('should check nodeLook for existing file ids', async () => {
      const causeStream = Readable.from([
        `id,title,description,significance,parentIssueId
  1,title 1,description 1,1,issueId1`,
      ]);
      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised
         1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z`,
      ]);

      const nodeLookup: NodeLookup = { issueId1: ParentTypeEnum.Issue };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {},
        'org1',
        apolloClient()
      );
      await sheetProcess.processSheet({
        stream: issueStream,
        sheet: issues,
      });
      await sheetProcess.processSheet({
        stream: causeStream,
        sheet: causes,
      });

      expect(sheetProcess.errors.length).toEqual(0);
    });

    it('should validate custom attributes', async () => {
      const customAttributeSchemaData: CustomAttributeSchemaData = {
        Id: '123',
        Schema: {
          properties: {
            '1702983795778_select': {
              enum: ['b', 'c', 'd', 'e', 'f'],
              type: 'string',
            },
          },
        },
        UiSchema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              label: 'Select Label',
              scope: '#/properties/1702983795778_select',
            },
          ],
        },
      };

      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised,Select Label
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z,a`,
      ]);

      const nodeLookup: NodeLookup = { issueId1: ParentTypeEnum.Issue };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {
          [ParentTypeEnum.Issue]: { customAttributeSchemaData },
        },
        'org1',
        apolloClient()
      );
      await sheetProcess.processSheet({
        stream: issueStream,
        sheet: issues,
      });

      expect(sheetProcess.errors.length).toEqual(1);
      expect(sheetProcess.errors).toEqual([
        {
          file: 'issue.csv',
          message: 'Select Label - "a" not in "b","c","d","e","f"',
          row: 2,
        },
      ]);
    });

    it('should return custom attribute data', async () => {
      const customAttributeSchemaData: CustomAttributeSchemaData = {
        Id: '123',
        Schema: {
          properties: {
            '1702983795778_select': {
              enum: ['b', 'c', 'd', 'e', 'f'],
              type: 'string',
            },
          },
        },
        UiSchema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              label: 'Select Label',
              scope: '#/properties/1702983795778_select',
            },
          ],
        },
      };

      const issueStream = Readable.from([
        `id,title,details,impactsCustomer,isExternalIssue,dateOccurred,dateIdentified,dateRaised,Select Label
  1,issue title,issue description,true,true,2023-11-24T21:29:27.734Z,2024-09-26T17:03:53.522Z,2024-03-18T23:05:44.916Z,b`,
      ]);

      const nodeLookup: NodeLookup = { issueId1: ParentTypeEnum.Issue };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {
          [ParentTypeEnum.Issue]: { customAttributeSchemaData },
        },
        'org1',
        apolloClient()
      );
      const results = await sheetProcess.processSheet({
        stream: issueStream,
        sheet: issues,
      });

      expect(sheetProcess.errors.length).toEqual(0);
      expect(results).toEqual([
        {
          id: expect.any(String),
          title: 'issue title',
          details: 'issue description',
          impactsCustomer: true,
          isExternalIssue: true,
          dateOccurred: '2023-11-24T21:29:27.734Z',
          dateIdentified: '2024-09-26T17:03:53.522Z',
          dateRaised: '2024-03-18T23:05:44.916Z',
          CustomAttributeData: { '1702983795778_select': 'b' },
        },
      ]);
    });

    it('should log error when keyDependantForeignKey does not exist', async () => {
      const actionParentsStream = Readable.from([
        `parentId,parentType,actionId
  1,other,2`,
      ]);

      const nodeLookup: NodeLookup = {
        '2': ParentTypeEnum.Action,
        '1': ParentTypeEnum.Risk,
      };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {},
        'org1',
        apolloClient()
      );
      await sheetProcess.processSheet({
        stream: actionParentsStream,
        sheet: actionParents,
      });

      expect(sheetProcess.errors.length).toEqual(1);
      expect(sheetProcess.errors).toEqual([
        {
          file: 'actionParents.csv',
          message: expect.any(String),
          row: 2,
        },
      ]);

      expect(
        sheetProcess.errors[0].message.startsWith(
          'parentType - Invalid enum value'
        )
      ).toBeTruthy();
    });

    it('should reference appropriate node when keyDependantForeignKey exists', async () => {
      const actionParentsStream = Readable.from([
        `parentId,parentType,actionId
  1,risk,2`,
      ]);

      const nodeLookup: NodeLookup = {
        '2': ParentTypeEnum.Action,
        '1': ParentTypeEnum.Risk,
      };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {},
        'org1',
        apolloClient()
      );

      const results = await sheetProcess.processSheet({
        stream: actionParentsStream,
        sheet: actionParents,
      });

      expect(sheetProcess.errors.length).toEqual(0);
      expect(results).toEqual([
        { actionId: '2', parentId: '1', parentType: 'risk' },
      ]);
    });

    it('should return errors on unique constraints across multiple fields', async () => {
      const actionParentsStream = Readable.from([
        `parentId,parentType,actionId
  1,risk,2
  1,risk,2`,
      ]);

      const nodeLookup: NodeLookup = {
        '2': ParentTypeEnum.Action,
        '1': ParentTypeEnum.Risk,
      };

      const sheetProcess = new SheetsProcessor(
        nodeLookup,
        {},
        'org1',
        apolloClient()
      );

      await sheetProcess.processSheet({
        stream: actionParentsStream,
        sheet: actionParents,
      });

      expect(sheetProcess.errors.length).toEqual(1);
      expect(sheetProcess.errors).toEqual([
        {
          file: 'actionParents.csv',
          message: 'actionId,parentId "2,1" already exists in csv file',
          row: 3,
        },
      ]);
    });
  });

  describe('addCustomFieldSchemaToSheet', () => {
    const customAttributeSchemaData: CustomAttributeSchemaData = {
      Id: 'test-schema',
      Schema: {
        properties: {},
      },
      UiSchema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };

    const mockSchemaLookup = {
      [ParentTypeEnum.Risk]: {
        customAttributeSchemaData,
        fieldsConfigData: [
          {
            FieldId: 'Title',
            Required: true,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: ParentTypeEnum.Risk,
          },
          {
            FieldId: 'Description',
            Required: false,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: ParentTypeEnum.Risk,
          },
          {
            FieldId: 'Status',
            Required: true,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: ParentTypeEnum.Risk,
          },
          {
            FieldId: 'Owner',
            Required: false,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: ParentTypeEnum.Risk,
          },
        ],
      },
    };

    let processor: SheetsProcessor;

    beforeEach(() => {
      processor = new SheetsProcessor(
        {},
        mockSchemaLookup,
        'test-org',
        apolloClient()
      );
    });

    it('should add superRefine validation when field becomes required', async () => {
      // Arrange: Create sheet with optional title field
      const originalSchema = z.object({
        id: z.string(),
        title: z.string().nullable(), // Originally optional/nullable
        description: z.string().nullable(),
        status: z.string(),
      });

      const sheet = {
        name: 'test.csv' as const,
        customAttributeType: ParentTypeEnum.Risk,
        schema: originalSchema,
        fields: [
          {
            key: 'id' as const,
            type: 'string' as const,
            isPrimaryKey: true,
          },
          {
            key: 'title' as const,
            fieldConfigFieldId: 'Title', // Maps to required field config
            type: 'string' as const,
          },
          {
            key: 'description' as const,
            fieldConfigFieldId: 'Description', // Maps to optional field config
            type: 'string' as const,
          },
          {
            key: 'status' as const,
            fieldConfigFieldId: 'Status', // Maps to required field config
            type: 'string' as const,
          },
        ],
        generateMockData: () => [],
        mapToInsert: () => ({}),
      };

      // Act: Apply custom field schema
      const result = processor.addCustomFieldSchemaToSheet(sheet);

      // Assert: Validation should now fail for empty title
      const validData = {
        id: '1',
        title: 'Valid Title',
        description: null,
        status: 'Active',
      };
      const invalidData = {
        id: '1',
        title: '',
        description: null,
        status: 'Active',
      }; // Empty title should fail
      const nullTitleData = {
        id: '1',
        title: null,
        description: null,
        status: 'Active',
      }; // Null title should fail

      const validResult = result.schema.safeParse(validData);
      const invalidResult = result.schema.safeParse(invalidData);
      const nullResult = result.schema.safeParse(nullTitleData);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
      expect(nullResult.success).toBe(false);
    });

    it('should make field optional when field becomes non-required', async () => {
      // Arrange: Create sheet with required status field
      const originalSchema = z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        status: z.string().nonempty(), // Originally required
      });

      const sheet = {
        name: 'test.csv' as const,
        customAttributeType: ParentTypeEnum.Risk,
        schema: originalSchema,
        fields: [
          {
            key: 'id' as const,
            type: 'string' as const,
            isPrimaryKey: true,
          },
          {
            key: 'title' as const,
            fieldConfigFieldId: 'Title', // Maps to required field config
            type: 'string' as const,
          },
          {
            key: 'description' as const,
            fieldConfigFieldId: 'Description', // Maps to optional field config
            type: 'string' as const,
          },
          {
            key: 'status' as const,
            fieldConfigFieldId: 'Owner', // Maps to optional field config (status -> Owner mapping)
            type: 'string' as const,
          },
        ],
        generateMockData: () => [],
        mapToInsert: () => ({}),
      };

      const mockSchemaLookup = {
        [ParentTypeEnum.Risk]: {
          customAttributeSchemaData,
          fieldsConfigData: [
            {
              FieldId: 'Owner',
              Required: false,
              Hidden: false,
              ReadOnly: false,
              FormConfigurationParentType: ParentTypeEnum.Risk,
            },
          ],
        },
      };

      const processor = new SheetsProcessor(
        {},
        mockSchemaLookup,
        'test-org',
        apolloClient()
      );

      // Act: Apply custom field schema
      const result = processor.addCustomFieldSchemaToSheet(sheet);

      // Assert: Status should now be optional/nullable
      const dataWithStatus = {
        id: '1',
        title: 'Title',
        description: null,
        status: 'Active',
      };
      const dataWithoutStatus = {
        id: '1',
        title: 'Title',
        description: null,
        status: null,
      };

      const withStatusResult = result.schema.safeParse(dataWithStatus);
      const withoutStatusResult = result.schema.safeParse(dataWithoutStatus);

      expect(withStatusResult.success).toBe(true);
      expect(withoutStatusResult.success).toBe(true); // Should now accept null
    });

    it('should not change schema when field has no matching fieldConfigFieldId', async () => {
      // Arrange: Create sheet with field that has no fieldConfigFieldId
      const originalSchema = z.object({
        id: z.string(),
        title: z.string().nullable(),
        unmappedField: z.number(), // This field has no fieldConfigFieldId
      });

      const sheet = {
        name: 'test.csv' as const,
        customAttributeType: ParentTypeEnum.Risk,
        schema: originalSchema,
        fields: [
          {
            key: 'id' as const,
            type: 'string' as const,
            isPrimaryKey: true,
          },
          {
            key: 'title' as const,
            fieldConfigFieldId: 'Title', // Maps to required field config
            type: 'string' as const,
          },
          {
            key: 'unmappedField' as const,
            // No fieldConfigFieldId - should remain unchanged
            type: 'number' as const,
          },
        ],
        generateMockData: () => [],
        mapToInsert: () => ({}),
      };

      // Act: Apply custom field schema
      const result = processor.addCustomFieldSchemaToSheet(sheet);

      // Assert: unmappedField should remain unchanged (still required number)
      const validData = { id: '1', title: 'Valid Title', unmappedField: 123 };
      const invalidData = {
        id: '1',
        title: 'Valid Title',
        unmappedField: null,
      }; // Should fail - still required

      const validResult = result.schema.safeParse(validData);
      const invalidResult = result.schema.safeParse(invalidData);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false); // unmappedField should still be required
    });

    it('should handle sheet without customAttributeType', async () => {
      // Arrange: Create sheet without customAttributeType
      const originalSchema = z.object({
        id: z.string(),
        title: z.string().nullable(),
      });

      const sheet = {
        name: 'test.csv' as const,
        // No customAttributeType
        schema: originalSchema,
        fields: [
          {
            key: 'id' as const,
            type: 'string' as const,
            isPrimaryKey: true,
          },
          {
            key: 'title' as const,
            type: 'string' as const,
          },
        ],
        generateMockData: () => [],
        mapToInsert: () => ({}),
      };

      // Act: Apply custom field schema
      const result = processor.addCustomFieldSchemaToSheet(sheet);

      // Assert: Schema should remain unchanged
      expect(result).toBe(sheet); // Should return the same object unchanged
      expect(result.schema).toBe(originalSchema); // Schema should be identical
    });

    it('should handle sheet with customAttributeType but no fieldsConfigData', async () => {
      // Arrange: Create processor with empty fieldsConfigData
      const emptyCustomAttributeSchemaData: CustomAttributeSchemaData = {
        Id: 'empty-schema',
        Schema: { properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      };

      const emptySchemaLookup = {
        [ParentTypeEnum.Risk]: {
          customAttributeSchemaData: emptyCustomAttributeSchemaData,
          // No fieldsConfigData
        },
      };

      const processorWithEmptyConfig = new SheetsProcessor(
        {},
        emptySchemaLookup,
        'test-org',
        apolloClient()
      );

      const originalSchema = z.object({
        id: z.string(),
        title: z.string().nullable(),
      });

      const sheet = {
        name: 'test.csv' as const,
        customAttributeType: ParentTypeEnum.Risk,
        schema: originalSchema,
        fields: [
          {
            key: 'id' as const,
            type: 'string' as const,
            isPrimaryKey: true,
          },
          {
            key: 'title' as const,
            fieldConfigFieldId: 'Title',
            type: 'string' as const,
          },
        ],
        generateMockData: () => [],
        mapToInsert: () => ({}),
      };

      // Act: Apply custom field schema
      const result =
        processorWithEmptyConfig.addCustomFieldSchemaToSheet(sheet);

      // Assert: Schema should remain unchanged
      expect(result).toBe(sheet); // Should return the same object unchanged
      expect(result.schema).toBe(originalSchema); // Schema should be identical
    });
  });
});
