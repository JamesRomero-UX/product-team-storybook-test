import { describe, expect, it } from 'vitest';

import {
  extractChildIds,
  extractGroupIds,
  extractParentIds,
  findIdsToRemove,
  getGroupResourceType,
  mapToChildRelationshipTupleCreateInputs,
  mapToChildRelationshipTupleDeleteInputs,
  mapToGroupRelationshipTupleCreateInputs,
  mapToGroupRelationshipTupleDeleteInputs,
  mapToParentRelationshipTupleCreateInputs,
  mapToParentRelationshipTupleDeleteInputs,
  mapToRoleAssignmentInputs,
  mapToRoleUnassignmentInputs,
  RS_PARENT_RELATION,
} from './transform';

interface MockRelationshipTuple {
  subject: string;
  object: string;
  relation: string;
  tenant: string;
}

const createMockRelationshipTuple = (
  subject: string,
  object: string
): MockRelationshipTuple => ({
  subject,
  object,
  relation: 'rs_parent',
  tenant: 'test-tenant',
});

describe('transform', () => {
  describe('extractParentIds', () => {
    it('should extract IDs from rs_node subjects', () => {
      const relationships = [
        createMockRelationshipTuple('rs_node:parent-1', 'rs_node:child-1'),
        createMockRelationshipTuple('rs_node:parent-2', 'rs_node:child-2'),
      ];

      const result = extractParentIds(relationships);

      expect(result).toEqual(['parent-1', 'parent-2']);
    });

    it('should filter out non-rs_node subjects', () => {
      const relationships = [
        createMockRelationshipTuple('rs_node:parent-1', 'rs_node:child-1'),
        createMockRelationshipTuple('other_type:parent-2', 'rs_node:child-2'),
        createMockRelationshipTuple('rs_node:parent-3', 'rs_node:child-3'),
      ];

      const result = extractParentIds(relationships);

      expect(result).toEqual(['parent-1', 'parent-3']);
    });

    it('should return empty array when no relationships provided', () => {
      const result = extractParentIds([]);

      expect(result).toEqual([]);
    });

    it('should return empty array when no rs_node subjects exist', () => {
      const relationships = [
        createMockRelationshipTuple('other_type:parent-1', 'rs_node:child-1'),
        createMockRelationshipTuple('another_type:parent-2', 'rs_node:child-2'),
      ];

      const result = extractParentIds(relationships);

      expect(result).toEqual([]);
    });
  });

  describe('extractChildIds', () => {
    it('should extract IDs from rs_node objects', () => {
      const relationships = [
        createMockRelationshipTuple('rs_node:parent-1', 'rs_node:child-1'),
        createMockRelationshipTuple('rs_node:parent-2', 'rs_node:child-2'),
      ];

      const result = extractChildIds(relationships);

      expect(result).toEqual(['child-1', 'child-2']);
    });

    it('should filter out non-rs_node objects', () => {
      const relationships = [
        createMockRelationshipTuple('rs_node:parent-1', 'rs_node:child-1'),
        createMockRelationshipTuple('rs_node:parent-2', 'other_type:child-2'),
        createMockRelationshipTuple('rs_node:parent-3', 'rs_node:child-3'),
      ];

      const result = extractChildIds(relationships);

      expect(result).toEqual(['child-1', 'child-3']);
    });

    it('should return empty array when no relationships provided', () => {
      const result = extractChildIds([]);

      expect(result).toEqual([]);
    });

    it('should return empty array when no rs_node objects exist', () => {
      const relationships = [
        createMockRelationshipTuple('rs_node:parent-1', 'other_type:child-1'),
        createMockRelationshipTuple('rs_node:parent-2', 'another_type:child-2'),
      ];

      const result = extractChildIds(relationships);

      expect(result).toEqual([]);
    });
  });

  describe('findIdsToRemove', () => {
    it('should find IDs that exist in current but not in desired', () => {
      const currentIds = ['a', 'b', 'c'];
      const desiredIds = ['b', 'd'];

      const result = findIdsToRemove(currentIds, desiredIds);

      expect(result).toEqual(['a', 'c']);
    });

    it('should return empty array when all current IDs are in desired', () => {
      const currentIds = ['a', 'b'];
      const desiredIds = ['a', 'b', 'c'];

      const result = findIdsToRemove(currentIds, desiredIds);

      expect(result).toEqual([]);
    });

    it('should return all current IDs when desired is empty', () => {
      const currentIds = ['a', 'b', 'c'];
      const desiredIds: string[] = [];

      const result = findIdsToRemove(currentIds, desiredIds);

      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array when current is empty', () => {
      const currentIds: string[] = [];
      const desiredIds = ['a', 'b'];

      const result = findIdsToRemove(currentIds, desiredIds);

      expect(result).toEqual([]);
    });

    it('should return empty array when both arrays are empty', () => {
      const result = findIdsToRemove([], []);

      expect(result).toEqual([]);
    });

    it('should handle duplicate IDs in current array', () => {
      const currentIds = ['a', 'a', 'b'];
      const desiredIds = ['b'];

      const result = findIdsToRemove(currentIds, desiredIds);

      expect(result).toEqual(['a', 'a']);
    });
  });

  describe('extractGroupIds', () => {
    it('should extract group IDs for owner_group resource type', () => {
      const relationships = [
        { subject: 'owner_group:group-1' },
        { subject: 'owner_group:group-2' },
      ];

      const result = extractGroupIds(relationships, 'owner_group');

      expect(result).toEqual(['group-1', 'group-2']);
    });

    it('should extract group IDs for contributor_group resource type', () => {
      const relationships = [
        { subject: 'contributor_group:group-1' },
        { subject: 'contributor_group:group-2' },
      ];

      const result = extractGroupIds(relationships, 'contributor_group');

      expect(result).toEqual(['group-1', 'group-2']);
    });

    it('should filter out non-matching resource types', () => {
      const relationships = [
        { subject: 'owner_group:group-1' },
        { subject: 'contributor_group:group-2' },
        { subject: 'owner_group:group-3' },
      ];

      const result = extractGroupIds(relationships, 'owner_group');

      expect(result).toEqual(['group-1', 'group-3']);
    });

    it('should return empty array when no relationships provided', () => {
      const result = extractGroupIds([], 'owner_group');

      expect(result).toEqual([]);
    });

    it('should return empty array when no matching resource types exist', () => {
      const relationships = [
        { subject: 'contributor_group:group-1' },
        { subject: 'other_type:group-2' },
      ];

      const result = extractGroupIds(relationships, 'owner_group');

      expect(result).toEqual([]);
    });

    it('should handle group IDs that contain colons', () => {
      const relationships = [{ subject: 'owner_group:group:with:colons' }];

      const result = extractGroupIds(relationships, 'owner_group');

      expect(result).toEqual(['group:with:colons']);
    });
  });

  describe('RS_PARENT_RELATION', () => {
    it('should be the expected constant value', () => {
      expect(RS_PARENT_RELATION).toBe('rs_parent');
    });
  });

  describe('createParentRelationshipInputs', () => {
    it('should create relationship inputs for parents', () => {
      const parents = [
        { parentType: 'rs_node', parentId: 'parent-1' },
        { parentType: 'rs_node', parentId: 'parent-2' },
      ];

      const result = mapToParentRelationshipTupleCreateInputs(
        parents,
        'rs_node:object-id',
        'test-org'
      );

      expect(result).toEqual([
        {
          subject: 'rs_node:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:object-id',
          tenant: 'test-org',
        },
        {
          subject: 'rs_node:parent-2',
          relation: 'rs_parent',
          object: 'rs_node:object-id',
          tenant: 'test-org',
        },
      ]);
    });

    it('should return empty array when no parents provided', () => {
      const result = mapToParentRelationshipTupleCreateInputs(
        [],
        'rs_node:object-id',
        'test-org'
      );

      expect(result).toEqual([]);
    });

    it('should handle different parent types', () => {
      const parents = [{ parentType: 'custom_type', parentId: 'parent-1' }];

      const result = mapToParentRelationshipTupleCreateInputs(
        parents,
        'rs_node:object-id',
        'test-org'
      );

      expect(result).toEqual([
        {
          subject: 'custom_type:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:object-id',
          tenant: 'test-org',
        },
      ]);
    });
  });

  describe('createChildRelationshipInputs', () => {
    it('should create relationship inputs for children', () => {
      const children = [
        { childType: 'rs_node', childId: 'child-1' },
        { childType: 'rs_node', childId: 'child-2' },
      ];

      const result = mapToChildRelationshipTupleCreateInputs(
        children,
        'rs_node:object-id',
        'test-org'
      );

      expect(result).toEqual([
        {
          subject: 'rs_node:object-id',
          relation: 'rs_parent',
          object: 'rs_node:child-1',
          tenant: 'test-org',
        },
        {
          subject: 'rs_node:object-id',
          relation: 'rs_parent',
          object: 'rs_node:child-2',
          tenant: 'test-org',
        },
      ]);
    });

    it('should return empty array when no children provided', () => {
      const result = mapToChildRelationshipTupleCreateInputs(
        [],
        'rs_node:object-id',
        'test-org'
      );

      expect(result).toEqual([]);
    });

    it('should handle different child types', () => {
      const children = [{ childType: 'custom_type', childId: 'child-1' }];

      const result = mapToChildRelationshipTupleCreateInputs(
        children,
        'rs_node:object-id',
        'test-org'
      );

      expect(result).toEqual([
        {
          subject: 'rs_node:object-id',
          relation: 'rs_parent',
          object: 'custom_type:child-1',
          tenant: 'test-org',
        },
      ]);
    });
  });

  describe('createParentRelationshipTupleDeleteInputs', () => {
    it('should create delete inputs for parent relationships', () => {
      const ids = ['parent-1', 'parent-2'];

      const result = mapToParentRelationshipTupleDeleteInputs(
        ids,
        'rs_node:object-id'
      );

      expect(result).toEqual([
        {
          subject: 'rs_node:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:object-id',
        },
        {
          subject: 'rs_node:parent-2',
          relation: 'rs_parent',
          object: 'rs_node:object-id',
        },
      ]);
    });

    it('should return empty array when no ids provided', () => {
      const result = mapToParentRelationshipTupleDeleteInputs(
        [],
        'rs_node:object-id'
      );

      expect(result).toEqual([]);
    });
  });

  describe('createChildRelationshipTupleDeleteInputs', () => {
    it('should create delete inputs for child relationships', () => {
      const ids = ['child-1', 'child-2'];

      const result = mapToChildRelationshipTupleDeleteInputs(
        ids,
        'rs_node:object-id'
      );

      expect(result).toEqual([
        {
          subject: 'rs_node:object-id',
          relation: 'rs_parent',
          object: 'rs_node:child-1',
        },
        {
          subject: 'rs_node:object-id',
          relation: 'rs_parent',
          object: 'rs_node:child-2',
        },
      ]);
    });

    it('should return empty array when no ids provided', () => {
      const result = mapToChildRelationshipTupleDeleteInputs(
        [],
        'rs_node:object-id'
      );

      expect(result).toEqual([]);
    });
  });

  describe('getGroupResourceType', () => {
    it('should return owner_group for owner relation type', () => {
      expect(getGroupResourceType('owner')).toBe('owner_group');
    });

    it('should return contributor_group for contributor relation type', () => {
      expect(getGroupResourceType('contributor')).toBe('contributor_group');
    });
  });

  describe('createGroupRelationshipTupleCreateInputs', () => {
    it('should create relationship inputs for owner groups', () => {
      const groupIds = ['group-1', 'group-2'];

      const result = mapToGroupRelationshipTupleCreateInputs(
        groupIds,
        'rs_node:object-id',
        'owner',
        'test-org'
      );

      expect(result).toEqual([
        {
          subject: 'owner_group:group-1',
          relation: 'owner',
          object: 'rs_node:object-id',
          tenant: 'test-org',
        },
        {
          subject: 'owner_group:group-2',
          relation: 'owner',
          object: 'rs_node:object-id',
          tenant: 'test-org',
        },
      ]);
    });

    it('should create relationship inputs for contributor groups', () => {
      const groupIds = ['group-1'];

      const result = mapToGroupRelationshipTupleCreateInputs(
        groupIds,
        'rs_node:object-id',
        'contributor',
        'test-org'
      );

      expect(result).toEqual([
        {
          subject: 'contributor_group:group-1',
          relation: 'contributor',
          object: 'rs_node:object-id',
          tenant: 'test-org',
        },
      ]);
    });

    it('should return empty array when no group ids provided', () => {
      const result = mapToGroupRelationshipTupleCreateInputs(
        [],
        'rs_node:object-id',
        'owner',
        'test-org'
      );

      expect(result).toEqual([]);
    });
  });

  describe('createGroupRelationshipTupleDeleteInputs', () => {
    it('should create delete inputs for owner group relationships', () => {
      const groupIds = ['group-1', 'group-2'];

      const result = mapToGroupRelationshipTupleDeleteInputs(
        groupIds,
        'rs_node:object-id',
        'owner'
      );

      expect(result).toEqual([
        {
          subject: 'owner_group:group-1',
          relation: 'owner',
          object: 'rs_node:object-id',
        },
        {
          subject: 'owner_group:group-2',
          relation: 'owner',
          object: 'rs_node:object-id',
        },
      ]);
    });

    it('should create delete inputs for contributor group relationships', () => {
      const groupIds = ['group-1'];

      const result = mapToGroupRelationshipTupleDeleteInputs(
        groupIds,
        'rs_node:object-id',
        'contributor'
      );

      expect(result).toEqual([
        {
          subject: 'contributor_group:group-1',
          relation: 'contributor',
          object: 'rs_node:object-id',
        },
      ]);
    });

    it('should return empty array when no group ids provided', () => {
      const result = mapToGroupRelationshipTupleDeleteInputs(
        [],
        'rs_node:object-id',
        'owner'
      );

      expect(result).toEqual([]);
    });
  });

  describe('createRoleAssignmentInputs', () => {
    it('should create role assignment inputs for Owner role', () => {
      const userIds = ['user-1', 'user-2'];

      const result = mapToRoleAssignmentInputs(
        userIds,
        'rs_node:object-id',
        'Owner',
        'test-org'
      );

      expect(result).toEqual([
        {
          resource_instance: 'rs_node:object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-1',
        },
        {
          resource_instance: 'rs_node:object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-2',
        },
      ]);
    });

    it('should create role assignment inputs for Contributor role', () => {
      const userIds = ['user-1'];

      const result = mapToRoleAssignmentInputs(
        userIds,
        'rs_node:object-id',
        'Contributor',
        'test-org'
      );

      expect(result).toEqual([
        {
          resource_instance: 'rs_node:object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-1',
        },
      ]);
    });

    it('should return empty array when no user ids provided', () => {
      const result = mapToRoleAssignmentInputs(
        [],
        'rs_node:object-id',
        'Owner',
        'test-org'
      );

      expect(result).toEqual([]);
    });
  });

  describe('createRoleUnassignmentInputs', () => {
    it('should create role unassignment inputs for Owner role', () => {
      const userIds = ['user-1', 'user-2'];

      const result = mapToRoleUnassignmentInputs(
        userIds,
        'rs_node:object-id',
        'Owner',
        'test-org'
      );

      expect(result).toEqual([
        {
          resource_instance: 'rs_node:object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-1',
        },
        {
          resource_instance: 'rs_node:object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-2',
        },
      ]);
    });

    it('should create role unassignment inputs for Contributor role', () => {
      const userIds = ['user-1'];

      const result = mapToRoleUnassignmentInputs(
        userIds,
        'rs_node:object-id',
        'Contributor',
        'test-org'
      );

      expect(result).toEqual([
        {
          resource_instance: 'rs_node:object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-1',
        },
      ]);
    });

    it('should return empty array when no user ids provided', () => {
      const result = mapToRoleUnassignmentInputs(
        [],
        'rs_node:object-id',
        'Owner',
        'test-org'
      );

      expect(result).toEqual([]);
    });
  });
});
