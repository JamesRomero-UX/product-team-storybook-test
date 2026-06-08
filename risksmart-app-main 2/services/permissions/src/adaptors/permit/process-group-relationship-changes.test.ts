import type { Logger } from '@aws-lambda-powertools/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { CreateGroupRelationshipChangesProcessorProps } from './process-group-relationship-changes';
import { createGroupRelationshipChangesProcessor } from './process-group-relationship-changes';

describe('process-group-relationship-changes', () => {
  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockTryCreateRelationshipTuple = vi.fn();
  const mockTryDeleteRelationshipTuple = vi.fn();

  const builderProps: CreateGroupRelationshipChangesProcessorProps = {
    logger: mockLogger as Logger,
    tryCreateRelationshipTuple: mockTryCreateRelationshipTuple,
    tryDeleteRelationshipTuple: mockTryDeleteRelationshipTuple,
  };

  const baseParams = {
    orgKey: 'test-org',
    objectId: 'test-object-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
    mockTryDeleteRelationshipTuple.mockResolvedValue(undefined);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Insert operation', () => {
    it('should return early when desiredGroupsWithAccess is empty', async () => {
      const processGroupRelationshipChanges =
        createGroupRelationshipChangesProcessor(builderProps);

      await processGroupRelationshipChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredGroupsWithAccess: [],
        relationType: 'owner',
      });

      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should create owner group relationship tuples', async () => {
      const desiredGroupsWithAccess = [
        { userGroupId: 'group-1' },
        { userGroupId: 'group-2' },
      ];
      const processGroupRelationshipChanges =
        createGroupRelationshipChangesProcessor(builderProps);

      await processGroupRelationshipChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredGroupsWithAccess,
        relationType: 'owner',
      });

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryCreateRelationshipTuple).toHaveBeenNthCalledWith(1, {
        subject: 'owner_group:group-1',
        relation: 'owner',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
      expect(mockTryCreateRelationshipTuple).toHaveBeenNthCalledWith(2, {
        subject: 'owner_group:group-2',
        relation: 'owner',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
    });

    it('should create contributor group relationship tuples', async () => {
      const desiredGroupsWithAccess = [{ userGroupId: 'group-3' }];
      const processGroupRelationshipChanges =
        createGroupRelationshipChangesProcessor(builderProps);

      await processGroupRelationshipChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredGroupsWithAccess,
        relationType: 'contributor',
      });

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'contributor_group:group-3',
        relation: 'contributor',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
    });

    it('should not try to delete relationship tuples for Insert operations', async () => {
      const desiredGroupsWithAccess = [{ userGroupId: 'group-1' }];
      const processGroupRelationshipChanges =
        createGroupRelationshipChangesProcessor(builderProps);

      await processGroupRelationshipChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredGroupsWithAccess,
        relationType: 'owner',
      });

      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });
  });

  describe('Update operation', () => {
    describe('owner groups', () => {
      it('should remove old owner group relationships and create new ones', async () => {
        const existingGroupRelationships = [
          { subject: 'owner_group:group-1', relation: 'owner' },
          { subject: 'owner_group:group-2', relation: 'owner' },
        ];

        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [
            { userGroupId: 'group-2' },
            { userGroupId: 'group-3' },
          ],
          relationType: 'owner',
          existingGroupRelationships,
        });

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(1);
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-1',
          relation: 'owner',
          object: 'rs_node:test-object-id',
        });

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-2',
          relation: 'owner',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-3',
          relation: 'owner',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
      });

      it('should remove old owner group relationships without creating new ones if not needed', async () => {
        const existingGroupRelationships = [
          { subject: 'owner_group:group-1', relation: 'owner' },
          { subject: 'owner_group:group-2', relation: 'owner' },
        ];

        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [],
          relationType: 'owner',
          existingGroupRelationships,
        });

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(2);
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-1',
          relation: 'owner',
          object: 'rs_node:test-object-id',
        });
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-2',
          relation: 'owner',
          object: 'rs_node:test-object-id',
        });

        expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      });

      it('should not remove old owner group relationships if none present but create new ones as needed', async () => {
        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [
            { userGroupId: 'group-1' },
            { userGroupId: 'group-2' },
          ],
          relationType: 'owner',
          existingGroupRelationships: [],
        });

        expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-1',
          relation: 'owner',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:group-2',
          relation: 'owner',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
      });

      it('should filter by owner relation when processing owner groups', async () => {
        const existingGroupRelationships = [
          { subject: 'owner_group:owner-group-1', relation: 'owner' },
          {
            subject: 'contributor_group:contributor-group-1',
            relation: 'contributor',
          },
          { subject: 'owner_group:owner-group-2', relation: 'owner' },
        ];

        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [{ userGroupId: 'owner-group-2' }],
          relationType: 'owner',
          existingGroupRelationships,
        });

        // Should delete only owner-group-1, not contributor-group-1
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(1);
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'owner_group:owner-group-1',
          relation: 'owner',
          object: 'rs_node:test-object-id',
        });
      });
    });

    describe('contributor groups', () => {
      it('should remove old contributor group relationships and create new ones', async () => {
        const existingGroupRelationships = [
          { subject: 'contributor_group:group-1', relation: 'contributor' },
          { subject: 'contributor_group:group-2', relation: 'contributor' },
        ];

        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [
            { userGroupId: 'group-2' },
            { userGroupId: 'group-3' },
          ],
          relationType: 'contributor',
          existingGroupRelationships,
        });

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(1);
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-1',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
        });

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-2',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-3',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
      });

      it('should remove old contributor group relationships without creating new ones if not needed', async () => {
        const existingGroupRelationships = [
          { subject: 'contributor_group:group-1', relation: 'contributor' },
          { subject: 'contributor_group:group-2', relation: 'contributor' },
        ];

        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [],
          relationType: 'contributor',
          existingGroupRelationships,
        });

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(2);
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-1',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
        });
        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-2',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
        });

        expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      });

      it('should not remove old contributor group relationships if none present but create new ones as needed', async () => {
        const processGroupRelationshipChanges =
          createGroupRelationshipChangesProcessor(builderProps);

        await processGroupRelationshipChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredGroupsWithAccess: [
            { userGroupId: 'group-1' },
            { userGroupId: 'group-2' },
          ],
          relationType: 'contributor',
          existingGroupRelationships: [],
        });

        expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-1',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'contributor_group:group-2',
          relation: 'contributor',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
      });
    });
  });
});
