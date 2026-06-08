import type { PermitSDK } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { processUserEntityChange } from './processUserEntityChange';
import { pollForResourceInstance } from './utils';

vi.mock('./utils', () => ({
  pollForResourceInstance: vi.fn(),
}));

// Mock setTimeout to control timing in tests
vi.mock('timers', () => ({
  setTimeout: vi.fn(),
}));

const mockPermit = {
  api: {
    roleAssignments: {
      list: vi.fn(),
      assign: vi.fn(),
      unassign: vi.fn(),
    },
    relationshipTuples: {
      list: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
} as unknown as Permit;

const mockPermitRsSDK = {
  resourceInstanceExists: vi.fn(),
} as unknown as PermitSDK;

beforeEach(() => {
  vi.mocked(pollForResourceInstance).mockResolvedValue(true);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('processUserEntityChange', () => {
  describe('when OP is UPDATE', () => {
    it('should skip processing', async () => {
      const config = {
        OP: 'UPDATE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

      expect(pollForResourceInstance).not.toHaveBeenCalled();
      expect(mockPermit.api.roleAssignments.list).not.toHaveBeenCalled();
      expect(mockPermit.api.relationshipTuples.list).not.toHaveBeenCalled();
    });
  });

  describe('when OP is DELETE', () => {
    it('should wait 3 seconds before checking resource existence', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);

      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      const processPromise = processUserEntityChange(
        mockPermit,
        mockPermitRsSDK,
        config
      );

      // Fast-forward through the 3-second delay
      await vi.advanceTimersByTimeAsync(3000);

      await processPromise;

      expect(pollForResourceInstance).toHaveBeenCalledWith(
        expect.anything(),
        mockPermitRsSDK,
        'rs_node',
        'test-id',
        'test-org'
      );
    });

    it('should skip delete operation if resource does not exist', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);

      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      const processPromise = processUserEntityChange(
        mockPermit,
        mockPermitRsSDK,
        config
      );
      await vi.advanceTimersByTimeAsync(3000);
      await processPromise;

      expect(mockPermit.api.roleAssignments.list).not.toHaveBeenCalled();
      expect(mockPermit.api.relationshipTuples.list).not.toHaveBeenCalled();
    });

    it('should skip delete operation when no owner or contributor is defined', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);

      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      const processPromise = processUserEntityChange(
        mockPermit,
        mockPermitRsSDK,
        config
      );
      await vi.advanceTimersByTimeAsync(3000);
      await processPromise;

      expect(mockPermit.api.roleAssignments.unassign).not.toHaveBeenCalled();
      expect(mockPermit.api.relationshipTuples.delete).not.toHaveBeenCalled();
    });

    describe('when resource exists', () => {
      beforeEach(() => {
        vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      });

      describe('owner role assignment', () => {
        it('should skip removal if owner is not assigned', async () => {
          vi.mocked(mockPermit.api.roleAssignments.list).mockResolvedValue([]);

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            OwnerId: 'test-owner-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(
            mockPermit.api.roleAssignments.unassign
          ).not.toHaveBeenCalled();
        });

        it('should remove owner role assignment if owner is assigned', async () => {
          vi.mocked(mockPermit.api.roleAssignments.list).mockResolvedValue([
            {
              role: 'Owner',
              user: 'test-owner-id',
            },
          ]);

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            OwnerId: 'test-owner-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(mockPermit.api.roleAssignments.unassign).toHaveBeenCalledWith({
            resource_instance: 'rs_node:test-id',
            role: 'Owner',
            tenant: 'test-org',
            user: 'test-owner-id',
          });
        });
      });

      describe('contributor role assignment', () => {
        it('should skip removal if contributor is not assigned', async () => {
          vi.mocked(mockPermit.api.roleAssignments.list).mockResolvedValue([]);

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            ContributorId: 'test-contributor-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(
            mockPermit.api.roleAssignments.unassign
          ).not.toHaveBeenCalled();
        });

        it('should remove contributor role assignment if contributor is assigned', async () => {
          vi.mocked(mockPermit.api.roleAssignments.list).mockResolvedValue([
            {
              role: 'Contributor',
              user: 'test-contributor-id',
            },
          ]);

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            ContributorId: 'test-contributor-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(mockPermit.api.roleAssignments.unassign).toHaveBeenCalledWith({
            resource_instance: 'rs_node:test-id',
            role: 'Contributor',
            tenant: 'test-org',
            user: 'test-contributor-id',
          });
        });
      });

      describe('owner group relationship tuple', () => {
        it('should skip removal if owner group is not assigned', async () => {
          vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue(
            []
          );

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            OwnerGroupId: 'test-owner-group-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(
            mockPermit.api.relationshipTuples.delete
          ).not.toHaveBeenCalled();
        });

        it('should remove owner group relationship tuple if owner group is assigned', async () => {
          vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([
            {
              id: 'tuple-1',
              subject: '',
              relation: '',
              object: '',
              subject_id: '',
              relation_id: '',
              object_id: '',
              tenant_id: '',
              organization_id: '',
              project_id: '',
              environment_id: '',
              created_at: '',
              updated_at: '',
            },
          ]);

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            OwnerGroupId: 'test-owner-group-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(mockPermit.api.relationshipTuples.delete).toHaveBeenCalledWith(
            {
              subject: 'owner_group:test-owner-group-id',
              relation: 'owner',
              object: 'rs_node:test-id',
            }
          );
        });
      });

      describe('contributor group relationship tuple', () => {
        it('should skip removal if contributor group is not assigned', async () => {
          vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue(
            []
          );

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            ContributorGroupId: 'test-contributor-group-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(
            mockPermit.api.relationshipTuples.delete
          ).not.toHaveBeenCalled();
        });

        it('should remove contributor group relationship tuple if contributor group is assigned', async () => {
          vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([
            {
              id: 'tuple-1',
              subject: '',
              relation: '',
              object: '',
              subject_id: '',
              relation_id: '',
              object_id: '',
              tenant_id: '',
              organization_id: '',
              project_id: '',
              environment_id: '',
              created_at: '',
              updated_at: '',
            },
          ]);

          const config = {
            OP: 'DELETE' as const,
            OrgKey: 'test-org',
            Id: 'test-id',
            ContributorGroupId: 'test-contributor-group-id',
          };

          const processPromise = processUserEntityChange(
            mockPermit,
            mockPermitRsSDK,
            config
          );
          await vi.advanceTimersByTimeAsync(3000);
          await processPromise;

          expect(mockPermit.api.relationshipTuples.delete).toHaveBeenCalledWith(
            {
              subject: 'contributor_group:test-contributor-group-id',
              relation: 'contributor',
              object: 'rs_node:test-id',
            }
          );
        });
      });
    });
  });

  describe('when OP is INSERT', () => {
    it('should skip processing if resource does not exist', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });

    it('should skip processing when no owner or contributor is defined', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
      };

      await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });

    describe('when resource exists', () => {
      beforeEach(() => {
        vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      });

      it('should create owner role assignment', async () => {
        const config = {
          OP: 'INSERT' as const,
          OrgKey: 'test-org',
          Id: 'test-id',
          OwnerId: 'test-owner-id',
        };

        await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

        expect(mockPermit.api.roleAssignments.assign).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'test-owner-id',
        });
      });

      it('should create contributor role assignment', async () => {
        const config = {
          OP: 'INSERT' as const,
          OrgKey: 'test-org',
          Id: 'test-id',
          ContributorId: 'test-contributor-id',
        };

        await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

        expect(mockPermit.api.roleAssignments.assign).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'test-contributor-id',
        });
      });

      it('should create owner group relationship tuple', async () => {
        const config = {
          OP: 'INSERT' as const,
          OrgKey: 'test-org',
          Id: 'test-id',
          OwnerGroupId: 'test-owner-group-id',
        };

        await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

        expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
          subject: 'owner_group:test-owner-group-id',
          relation: 'owner',
          object: 'rs_node:test-id',
          tenant: 'test-org',
        });
      });

      it('should create contributor group relationship tuple', async () => {
        const config = {
          OP: 'INSERT' as const,
          OrgKey: 'test-org',
          Id: 'test-id',
          ContributorGroupId: 'test-contributor-group-id',
        };

        await processUserEntityChange(mockPermit, mockPermitRsSDK, config);

        expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
          subject: 'contributor_group:test-contributor-group-id',
          relation: 'contributor',
          object: 'rs_node:test-id',
          tenant: 'test-org',
        });
      });
    });
  });
});
