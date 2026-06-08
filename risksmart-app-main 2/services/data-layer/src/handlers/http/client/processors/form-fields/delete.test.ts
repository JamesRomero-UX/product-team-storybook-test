import {
  deleteFieldAndPersist,
  FormFieldOperationError,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FormFieldRepository } from '../../../../../repositories/form-field-repository';
import type { DeleteFormFieldRequest } from '../../../../../schemas/form-field';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor } from './delete';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

vi.mock('@risksmart-app/form-configuration/src/field-orchestrator', () => ({
  deleteFieldAndPersist: vi.fn(),
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

const mockPayload: DeleteFormFieldRequest = {
  FieldId: 'CustomAttributeData.123_text',
  ParentType: 'risk',
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

describe('delete form field processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a form field with existing schema', async () => {
    const existingSchema = {
      customAttributeSchema: {
        Id: 'schema-123',
        Schema: { type: 'object', properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      },
      fields_config: [
        {
          FieldId: 'CustomAttributeData.123_text',
          Label: 'Test Field',
          Required: false,
          Hidden: false,
          ReadOnly: false,
        },
      ],
    };

    mockFindByParentType.mockResolvedValue(existingSchema);
    vi.mocked(deleteFieldAndPersist).mockResolvedValue({
      fieldId: 'CustomAttributeData.123_text',
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    const result = await processor({
      payload: mockPayload,
      context: mockContext,
    });

    expect(result).toEqual({ Id: 'CustomAttributeData.123_text' });

    expect(mockFindByParentType).toHaveBeenCalledWith('risk');
    expect(deleteFieldAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        field: {
          fieldId: 'CustomAttributeData.123_text',
          parentType: 'risk',
        },
        currentCustomAttributeSchema: {
          id: 'schema-123',
          schema: existingSchema.customAttributeSchema.Schema,
          uiSchema: existingSchema.customAttributeSchema.UiSchema,
        },
        allFieldConfigurations: expect.arrayContaining([
          expect.objectContaining({
            fieldId: 'CustomAttributeData.123_text',
          }),
        ]),
      })
    );
  });

  it('throws BadRequest when schema not found', async () => {
    mockFindByParentType.mockResolvedValue(undefined);

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Custom attribute schema not found');

    expect(deleteFieldAndPersist).not.toHaveBeenCalled();
  });

  it('throws BadRequest when customAttributeSchema is null', async () => {
    mockFindByParentType.mockResolvedValue({
      customAttributeSchema: null,
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Custom attribute schema not found');

    expect(deleteFieldAndPersist).not.toHaveBeenCalled();
  });

  it('calls persist with correct user context', async () => {
    const existingSchema = {
      customAttributeSchema: {
        Id: 'schema-123',
        Schema: { type: 'object', properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      },
      fields_config: [],
    };

    mockFindByParentType.mockResolvedValue(existingSchema);

    let capturedPersist: (args: unknown) => Promise<void>;
    vi.mocked(deleteFieldAndPersist).mockImplementation(async (args) => {
      capturedPersist = args.persist as (args: unknown) => Promise<void>;
      await capturedPersist({
        schemaId: 'schema-123',
        parentType: 'risk',
        formFieldConfigurations: [],
        schema: {},
        uiSchema: {},
        fieldsToDelete: ['CustomAttributeData.123_text'],
      });

      return { fieldId: 'CustomAttributeData.123_text' };
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await processor({
      payload: mockPayload,
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
    const existingSchema = {
      customAttributeSchema: {
        Id: 'schema-123',
        Schema: { type: 'object', properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      },
      fields_config: [],
    };

    mockFindByParentType.mockResolvedValue(existingSchema);
    vi.mocked(deleteFieldAndPersist).mockRejectedValue(
      new FormFieldOperationError('FIELD_NOT_FOUND', 'Field not found')
    );

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Field not found');
  });

  it('rethrows unexpected errors', async () => {
    const existingSchema = {
      customAttributeSchema: {
        Id: 'schema-123',
        Schema: { type: 'object', properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      },
      fields_config: [],
    };

    mockFindByParentType.mockResolvedValue(existingSchema);
    const unexpectedError = new Error('Database connection failed');
    vi.mocked(deleteFieldAndPersist).mockRejectedValue(unexpectedError);

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Database connection failed');
  });
});
