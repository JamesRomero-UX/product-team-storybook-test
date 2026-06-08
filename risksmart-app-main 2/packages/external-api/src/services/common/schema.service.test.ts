import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  FormConfigsByParentTypesResponse,
  IClient,
} from '../../clients/client.interface';
import { CustomFieldValidationError } from '../../errors/custom-field.errors';
import { DepartmentValidationError } from '../../errors/department.errors';
import { UserValidationError } from '../../errors/user.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type { ServiceCallContext } from '../../types/service';
import type { DepartmentsService } from '../departments/departments.service';
import type { UsersService } from '../users/users.service';
import { schemaService } from './schema.service';

// Helper to build a minimal formConfigs array for validateAndTransformCustomFields.
// propKey format: `${13-digit-id}_${kind}`, e.g. "1234567890001_text"
// FieldId in fields_config: `CustomAttributeData.${propKey}`
const buildFormConfigs = (
  fields: Array<{
    id: string;
    kind: string;
    required?: boolean;
    defaultValue?: string | string[] | number | null;
    enum?: string[];
  }>
): FormConfigsByParentTypesResponse['formConfiguration'] => {
  const properties: Record<string, { enum?: string[]; format?: string }> = {};
  const fields_config: Array<{
    FieldId: string;
    Hidden: boolean;
    Required: boolean;
    ReadOnly: boolean;
    DefaultValue: string | string[] | number | null;
  }> = [];

  for (const f of fields) {
    const propKey = `${f.id}_${f.kind}`;
    properties[propKey] = f.enum ? { enum: f.enum } : {};
    fields_config.push({
      FieldId: `CustomAttributeData.${propKey}`,
      Hidden: false,
      Required: f.required ?? false,
      ReadOnly: false,
      DefaultValue: f.defaultValue ?? null,
    });
  }

  return [
    {
      ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
      customAttributeSchema: {
        Schema: { properties },
        UiSchema: { elements: [] },
      },
      fields_config,
    },
  ] as unknown as FormConfigsByParentTypesResponse['formConfiguration'];
};

describe('schemaService', () => {
  let mockClient: IClient;
  let mockUsersService: UsersService;
  let mockDepartmentsService: DepartmentsService;
  let mockContext: ServiceCallContext & MutateServiceContext;
  let service: ReturnType<typeof schemaService>;

  const mockFormConfigurations = [
    {
      ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
      customAttributeSchema: {
        Schema: { properties: {} },
        UiSchema: { elements: [] },
      },
      fields_config: [],
    },
  ];

  const mockResponse: FormConfigsByParentTypesResponse = {
    formConfiguration:
      mockFormConfigurations as unknown as FormConfigsByParentTypesResponse['formConfiguration'],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      getFormConfigsByParentTypes: vi.fn(),
    } as unknown as IClient;

    mockUsersService = {
      validateUserIds: vi.fn(),
    } as unknown as UsersService;

    mockDepartmentsService = {
      validateDepartmentIds: vi.fn(),
    } as unknown as DepartmentsService;

    mockContext = {
      authToken: 'Bearer test-token',
      tenantId: 'test-tenant',
      orgId: 'test-org',
    };

    service = schemaService(mockClient, mockUsersService, mockDepartmentsService);
  });

  describe('getResourceSchema', () => {
    it('calls getFormConfigsByParentTypes with correct args and returns formConfiguration', async () => {
      vi.mocked(mockClient.getFormConfigsByParentTypes).mockResolvedValue(
        mockResponse
      );

      const result = await service.getResourceSchema('risk', mockContext);

      expect(
        mockClient.getFormConfigsByParentTypes
      ).toHaveBeenCalledExactlyOnceWith(
        { authorization: 'Bearer test-token' },
        ['risk']
      );
      expect(result).toBe(mockResponse.formConfiguration);
    });

    it('propagates error when client throws', async () => {
      const clientError = new Error('tRPC client error');
      vi.mocked(mockClient.getFormConfigsByParentTypes).mockRejectedValue(
        clientError
      );

      await expect(
        service.getResourceSchema('risk', mockContext)
      ).rejects.toThrow('tRPC client error');
    });

    it.each([
      ['issue' as const],
      ['action' as const],
      ['control' as const],
      ['assessment' as const],
      ['document' as const],
      ['indicator' as const],
    ])('calls with correct parentType for %s', async (parentType) => {
      vi.mocked(mockClient.getFormConfigsByParentTypes).mockResolvedValue(
        mockResponse
      );

      await service.getResourceSchema(parentType, mockContext);

      expect(mockClient.getFormConfigsByParentTypes).toHaveBeenCalledWith(
        expect.anything(),
        [parentType]
      );
    });
  });

  describe('validateAndTransformCustomFields', () => {
    it('throws CustomFieldValidationError when formConfigs is empty and customFields are provided', async () => {
      await expect(
        service.validateAndTransformCustomFields({
          customFields: [{ id: '1234567890123', value: 'foo' }],
          formConfigs: [],
          existingCustomAttributeData: null,
          isCreate: true,
          ctx: mockContext,
        })
      ).rejects.toThrow(CustomFieldValidationError);
    });

    it('throws CustomFieldValidationError when formConfigs is null/undefined and customFields are provided', async () => {
      await expect(
        service.validateAndTransformCustomFields({
          customFields: [{ id: '1234567890123', value: 'foo' }],
          formConfigs:
            null as unknown as FormConfigsByParentTypesResponse['formConfiguration'],
          existingCustomAttributeData: null,
          isCreate: true,
          ctx: mockContext,
        })
      ).rejects.toThrow(CustomFieldValidationError);
    });

    it('returns existingCustomAttributeData when formConfigs is empty and customFields is empty', async () => {
      const existing = { someKey: 'someValue' };
      const result = await service.validateAndTransformCustomFields({
        customFields: [],
        formConfigs: [],
        existingCustomAttributeData: existing,
        isCreate: false,
        ctx: mockContext,
      });
      expect(result).toBe(existing);
    });

    it('returns existingCustomAttributeData when formConfigs is empty and customFields is undefined', async () => {
      const existing = { someKey: 'someValue' };
      const result = await service.validateAndTransformCustomFields({
        customFields: undefined,
        formConfigs: [],
        existingCustomAttributeData: existing,
        isCreate: false,
        ctx: mockContext,
      });
      expect(result).toBe(existing);
    });

    describe('with formConfigs', () => {
      const TEXT_ID = '1234567890001';
      const SELECT_ID = '1234567890002';
      const REQUIRED_ID = '1234567890003';
      const DEFAULT_ID = '1234567890004';
      const USERMS_ID = '1234567890005';

      it('happy path: transforms input fields and returns them on create', async () => {
        const formConfigs = buildFormConfigs([
          { id: TEXT_ID, kind: 'text' },
          { id: SELECT_ID, kind: 'select', enum: ['Low', 'Medium', 'High'] },
        ]);

        const result = await service.validateAndTransformCustomFields({
          customFields: [
            { id: TEXT_ID, value: 'hello' },
            { id: SELECT_ID, value: 'Low' },
          ],
          formConfigs,
          existingCustomAttributeData: null,
          isCreate: true,
          ctx: mockContext,
        });

        expect(result).toEqual({
          [`${TEXT_ID}_text`]: 'hello',
          [`${SELECT_ID}_select`]: 'Low',
        });
      });

      it('happy path: update merges transformed fields with existing data', async () => {
        const formConfigs = buildFormConfigs([{ id: TEXT_ID, kind: 'text' }]);
        const existing = { untouched: 'keep-me', [`${TEXT_ID}_text`]: 'old' };

        const result = await service.validateAndTransformCustomFields({
          customFields: [{ id: TEXT_ID, value: 'updated' }],
          formConfigs,
          existingCustomAttributeData: existing,
          isCreate: false,
          ctx: mockContext,
        });

        expect(result).toEqual({
          untouched: 'keep-me',
          [`${TEXT_ID}_text`]: 'updated',
        });
      });

      it('happy path: create applies default values for fields not in input', async () => {
        const formConfigs = buildFormConfigs([
          { id: DEFAULT_ID, kind: 'text', defaultValue: 'my-default' },
        ]);

        const result = await service.validateAndTransformCustomFields({
          customFields: [],
          formConfigs,
          existingCustomAttributeData: null,
          isCreate: true,
          ctx: mockContext,
        });

        expect(result).toEqual({ [`${DEFAULT_ID}_text`]: 'my-default' });
      });

      it('throws CustomFieldValidationError for unknown field id', async () => {
        const formConfigs = buildFormConfigs([{ id: TEXT_ID, kind: 'text' }]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [{ id: '9999999999999', value: 'anything' }],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });

      it('throws CustomFieldValidationError for invalid enum value on select field', async () => {
        const formConfigs = buildFormConfigs([
          { id: SELECT_ID, kind: 'select', enum: ['Low', 'Medium', 'High'] },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [{ id: SELECT_ID, value: 'Critical' }],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });

      it('throws CustomFieldValidationError when a required field is missing on create', async () => {
        const formConfigs = buildFormConfigs([
          { id: REQUIRED_ID, kind: 'text', required: true },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });

      it('does NOT throw for a missing required field on update', async () => {
        const formConfigs = buildFormConfigs([
          { id: REQUIRED_ID, kind: 'text', required: true },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [],
            formConfigs,
            existingCustomAttributeData: { [`${REQUIRED_ID}_text`]: 'exists' },
            isCreate: false,
            ctx: mockContext,
          })
        ).resolves.not.toThrow();
      });

      it('happy path: usermultiselect validates user ids and dedupes', async () => {
        vi.mocked(mockUsersService.validateUserIds).mockResolvedValue(
          undefined as unknown as Awaited<
            ReturnType<UsersService['validateUserIds']>
          >
        );
        const formConfigs = buildFormConfigs([
          { id: USERMS_ID, kind: 'usermultiselect' },
        ]);
        const userIds = ['user-a', 'user-b', 'user-a'];

        const result = await service.validateAndTransformCustomFields({
          customFields: [{ id: USERMS_ID, value: userIds }],
          formConfigs,
          existingCustomAttributeData: null,
          isCreate: true,
          ctx: mockContext,
        });

        expect(mockUsersService.validateUserIds).toHaveBeenCalledWith(
          userIds,
          mockContext
        );
        expect(result).toEqual({
          [`${USERMS_ID}_usermultiselect`]: ['user-a', 'user-b'],
        });
      });

      it('throws CustomFieldValidationError when usermultiselect user validation fails', async () => {
        vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
          new UserValidationError('User not found: bad-user')
        );
        const formConfigs = buildFormConfigs([
          { id: USERMS_ID, kind: 'usermultiselect' },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [{ id: USERMS_ID, value: ['bad-user'] }],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });

      it('throws CustomFieldValidationError when usermultiselect value is not an array', async () => {
        const formConfigs = buildFormConfigs([
          { id: USERMS_ID, kind: 'usermultiselect' },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [{ id: USERMS_ID, value: 'not-an-array' }],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });

      const DEPTMS_ID = '1234567890006';

      it('happy path: departmentmultiselect validates department ids and dedupes', async () => {
        vi.mocked(mockDepartmentsService.validateDepartmentIds).mockResolvedValue(
          undefined as unknown as Awaited<
            ReturnType<DepartmentsService['validateDepartmentIds']>
          >
        );
        const formConfigs = buildFormConfigs([
          { id: DEPTMS_ID, kind: 'departmentmultiselect' },
        ]);
        const deptIds = ['dept-a', 'dept-b', 'dept-a'];

        const result = await service.validateAndTransformCustomFields({
          customFields: [{ id: DEPTMS_ID, value: deptIds }],
          formConfigs,
          existingCustomAttributeData: null,
          isCreate: true,
          ctx: mockContext,
        });

        expect(mockDepartmentsService.validateDepartmentIds).toHaveBeenCalledWith(
          deptIds,
          mockContext
        );
        expect(result).toEqual({
          [`${DEPTMS_ID}_departmentmultiselect`]: ['dept-a', 'dept-b'],
        });
      });

      it('throws CustomFieldValidationError when departmentmultiselect value is not an array', async () => {
        const formConfigs = buildFormConfigs([
          { id: DEPTMS_ID, kind: 'departmentmultiselect' },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [{ id: DEPTMS_ID, value: 'not-an-array' }],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });

      it('throws CustomFieldValidationError when departmentmultiselect department validation fails', async () => {
        vi.mocked(mockDepartmentsService.validateDepartmentIds).mockRejectedValue(
          new DepartmentValidationError('Departments with IDs bad-dept not found')
        );
        const formConfigs = buildFormConfigs([
          { id: DEPTMS_ID, kind: 'departmentmultiselect' },
        ]);

        await expect(
          service.validateAndTransformCustomFields({
            customFields: [{ id: DEPTMS_ID, value: ['bad-dept'] }],
            formConfigs,
            existingCustomAttributeData: null,
            isCreate: true,
            ctx: mockContext,
          })
        ).rejects.toThrow(CustomFieldValidationError);
      });
    });
  });
});
