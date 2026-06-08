import {
  FormFieldOperationError,
  updateFieldAndPersist,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FormFieldRepository } from '../../../../../repositories/form-field-repository';
import type { UpdateFormFieldRequest } from '../../../../../schemas/form-field';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor } from './update';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

vi.mock('@risksmart-app/form-configuration/src/field-orchestrator', () => ({
  updateFieldAndPersist: vi.fn(),
  FormFieldOperationError: class FormFieldOperationError extends Error {
    constructor(
      public code: string,
      message: string
    ) {
      super(message);
      this.name = 'FormFieldOperationError';
    }
  },
}));

vi.mock('../../../../../utils/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

const mockCustomFieldPayload: UpdateFormFieldRequest = {
  IsCustomField: true,
  FieldId: 'CustomAttributeData.123_text',
  Label: 'Updated Field',
  Options: [],
  ParentType: 'risk',
  Required: true,
  Hidden: false,
  ReadOnly: false,
};

const mockStandardFieldPayload: UpdateFormFieldRequest = {
  IsCustomField: false,
  FieldId: 'Title',
  Label: 'Custom Title Label',
  ParentType: 'risk',
  Required: true,
  Hidden: false,
  ReadOnly: false,
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockFindByParentType = vi.fn();
const mockPersist = vi.fn();

const mockFormFieldRepository: FormFieldRepository = {
  findByParentType: mockFindByParentType,
  persist: mockPersist,
};

describe('update form field processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a custom field with existing schema', async () => {
    const existingSchema = {
      customAttributeSchema: {
        Id: 'schema-123',
        Schema: { type: 'object', properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      },
    };

    mockFindByParentType.mockResolvedValue(existingSchema);
    vi.mocked(updateFieldAndPersist).mockResolvedValue({
      fieldId: 'CustomAttributeData.123_text',
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    const result = await processor({
      payload: mockCustomFieldPayload,
      context: mockContext,
    });

    expect(result).toEqual({ Id: 'CustomAttributeData.123_text' });

    expect(mockFindByParentType).toHaveBeenCalledWith('risk');
    expect(updateFieldAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        field: expect.objectContaining({
          fieldId: 'CustomAttributeData.123_text',
          parentType: 'risk',
          isCustomField: true,
          label: 'Updated Field',
        }),
        currentCustomAttributeSchema: {
          id: 'schema-123',
          schema: existingSchema.customAttributeSchema.Schema,
          uiSchema: existingSchema.customAttributeSchema.UiSchema,
        },
      })
    );
  });

  it('updates a standard field', async () => {
    mockFindByParentType.mockResolvedValue(undefined);
    vi.mocked(updateFieldAndPersist).mockResolvedValue({
      fieldId: 'Title',
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    const result = await processor({
      payload: mockStandardFieldPayload,
      context: mockContext,
    });

    expect(result).toEqual({ Id: 'Title' });

    expect(updateFieldAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        field: expect.objectContaining({
          fieldId: 'Title',
          isCustomField: false,
          label: 'Custom Title Label',
        }),
        currentCustomAttributeSchema: null,
      })
    );
  });

  it('calls persist with correct user context', async () => {
    mockFindByParentType.mockResolvedValue(undefined);

    let capturedPersist: (args: unknown) => Promise<void>;
    vi.mocked(updateFieldAndPersist).mockImplementation(async (args) => {
      capturedPersist = args.persist as (args: unknown) => Promise<void>;
      await capturedPersist({
        schemaId: 'schema-123',
        parentType: 'risk',
        formFieldConfigurations: [],
        schema: {},
        uiSchema: {},
        fieldsToDelete: [],
      });

      return { fieldId: 'field-123' };
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await processor({
      payload: mockStandardFieldPayload,
      context: mockContext,
    });

    expect(mockPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        orgKey: 'org-1',
      })
    );
  });

  it('throws BadRequest when FormFieldOperationError occurs', async () => {
    mockFindByParentType.mockResolvedValue(undefined);
    vi.mocked(updateFieldAndPersist).mockRejectedValue(
      new FormFieldOperationError(
        'CUSTOM_ATTRIBUTE_SCHEMA_NOT_FOUND',
        'Custom attribute schema not found'
      )
    );

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockCustomFieldPayload, context: mockContext })
    ).rejects.toThrow('Custom attribute schema not found');
  });

  it('rethrows unexpected errors', async () => {
    mockFindByParentType.mockResolvedValue(undefined);
    const unexpectedError = new Error('Database connection failed');
    vi.mocked(updateFieldAndPersist).mockRejectedValue(unexpectedError);

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockCustomFieldPayload, context: mockContext })
    ).rejects.toThrow('Database connection failed');
  });
});
