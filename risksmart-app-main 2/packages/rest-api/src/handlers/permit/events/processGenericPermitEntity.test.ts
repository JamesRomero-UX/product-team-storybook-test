import type { PermitSDK } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { processGenericPermitEntity } from './processGenericPermitEntity';
import { pollForResourceInstance } from './utils';

vi.mock('./utils');

const mockPermit = {
  api: {
    resourceInstances: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    relationshipTuples: {
      create: vi.fn(),
    },
  },
} as unknown as Permit;

const mockPermitRsSDK = {
  resourceInstanceExists: vi.fn(),
} as unknown as PermitSDK;

beforeEach(() => {
  vi.mocked(pollForResourceInstance).mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('processGenericPermitEntity', () => {
  describe('when OP is DELETE', () => {
    it('should delete resource instance', async () => {
      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.resourceInstances.delete).toHaveBeenCalledWith(
        'rs_node:test-id'
      );
    });
  });

  describe('when EntityType is undefined', () => {
    it('should skip resource creation', async () => {
      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        EntityType: undefined,
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.resourceInstances.create).not.toHaveBeenCalled();
    });
  });

  describe('when resource already exists', () => {
    it('should skip creation', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        EntityType: 'test-type',
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.resourceInstances.create).not.toHaveBeenCalled();
    });
  });

  describe('when resource does not exist', () => {
    it('should create resource instance', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);
      vi.mocked(mockPermit.api.resourceInstances.create).mockResolvedValue({
        resource_id: 'created-resource-id',
        key: '',
        resource: '',
        id: '',
        organization_id: '',
        project_id: '',
        environment_id: '',
        created_at: '',
        updated_at: '',
      });

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        EntityType: 'test-type',
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.resourceInstances.create).toHaveBeenCalledWith({
        key: 'test-id',
        resource: 'rs_node',
        tenant: 'test-org',
        attributes: {
          ObjectType: 'test-type',
        },
      });
    });

    it('should link to root resource if entity is root object type', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);
      vi.mocked(mockPermit.api.resourceInstances.create).mockResolvedValue({
        resource_id: 'created-resource-id',
        key: '',
        resource: '',
        id: '',
        organization_id: '',
        project_id: '',
        environment_id: '',
        created_at: '',
        updated_at: '',
      });

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        EntityType: 'risk',
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
        subject: 'rs_node:risk-test-org',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });
    });

    it.each(['issue-update', 'other-type'])(
      'should not link to root resource if entity is not root $objectType object type',
      async (objectType) => {
        vi.mocked(pollForResourceInstance).mockResolvedValue(false);
        vi.mocked(mockPermit.api.resourceInstances.create).mockResolvedValue({
          resource_id: 'created-resource-id',
          key: '',
          resource: '',
          id: '',
          organization_id: '',
          project_id: '',
          environment_id: '',
          created_at: '',
          updated_at: '',
        });

        const config = {
          OP: 'INSERT' as const,
          OrgKey: 'test-org',
          Id: 'test-id',
          EntityType: objectType,
        };

        await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

        expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
      }
    );
  });

  describe('when config has parents', () => {
    it('should create relationship tuples for each parent', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        EntityType: 'test-type',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type_1',
          },
          {
            ParentId: 'parent-2',
            ParentType: 'parent_type_2',
          },
        ],
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledTimes(2);
      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
        subject: 'parent_type_1:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });
      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
        subject: 'parent_type_2:parent-2',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });
    });
  });

  describe('when config has no parents', () => {
    it('should not create parent relationship tuples', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        EntityType: 'test-type',
      };

      await processGenericPermitEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });
  });
});
