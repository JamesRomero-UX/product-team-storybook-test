import {
  createFieldAndPersist,
  FormFieldOperationError,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FormFieldRepository } from '../../../../../repositories/form-field-repository';
import type { CreateFormFieldRequest } from '../../../../../schemas/form-field';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor } from './create';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

vi.mock('@risksmart-app/form-configuration/src/field-orchestrator', () => ({
  createFieldAndPersist: vi.fn(),
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

const mockPayload: CreateFormFieldRequest = {
  IsCustomField: true,
  Label: 'Test Field',
  Type: CustomAttributeFieldType.Text,
  Options: [],
  ParentType: 'risk',
  Required: false,
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

describe('create form field processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new form field when no existing schema exists', async () => {
    mockFindByParentType.mockResolvedValue(undefined);
    vi.mocked(createFieldAndPersist).mockResolvedValue({
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
    expect(createFieldAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        field: expect.objectContaining({
          parentType: 'risk',
          fieldType: CustomAttributeFieldType.Text,
          label: 'Test Field',
        }),
        currentCustomAttributeSchema: null,
      })
    );
  });

  it('creates a form field with existing schema', async () => {
    const existingSchema = {
      customAttributeSchema: {
        Id: 'schema-123',
        Schema: { type: 'object', properties: {} },
        UiSchema: { type: 'VerticalLayout', elements: [] },
      },
    };

    mockFindByParentType.mockResolvedValue(existingSchema);
    vi.mocked(createFieldAndPersist).mockResolvedValue({
      fieldId: 'CustomAttributeData.456_text',
    });

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    const result = await processor({
      payload: mockPayload,
      context: mockContext,
    });

    expect(result).toEqual({ Id: 'CustomAttributeData.456_text' });

    expect(createFieldAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        currentCustomAttributeSchema: {
          id: 'schema-123',
          schema: existingSchema.customAttributeSchema.Schema,
          uiSchema: existingSchema.customAttributeSchema.UiSchema,
        },
      })
    );
  });

  it('calls persist with correct user context', async () => {
    mockFindByParentType.mockResolvedValue(undefined);

    let capturedPersist: (args: unknown) => Promise<void>;
    vi.mocked(createFieldAndPersist).mockImplementation(async (args) => {
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
    mockFindByParentType.mockResolvedValue(undefined);
    vi.mocked(createFieldAndPersist).mockRejectedValue(
      new FormFieldOperationError('INVALID_FIELD_TYPE', 'Invalid field type')
    );

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Invalid field type');
  });

  it('rethrows unexpected errors', async () => {
    mockFindByParentType.mockResolvedValue(undefined);
    const unexpectedError = new Error('Database connection failed');
    vi.mocked(createFieldAndPersist).mockRejectedValue(unexpectedError);

    const processor = createProcessor({
      formFieldRepository: mockFormFieldRepository,
    });

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Database connection failed');
  });
});
