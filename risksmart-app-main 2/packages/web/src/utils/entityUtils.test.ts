import { describe, expect, it } from 'vitest';

import {
  buildEntityPathFromArray,
  type EntityWithParent,
  formatEntityForDisplay,
  getEntityDisplayLabel,
  getEntityPath,
  getRootEntity,
  hasEntityHierarchy,
} from './entityUtils';

describe('entityUtils', () => {
  const mockEntity: EntityWithParent = {
    Id: '1',
    Name: 'IT Department',
    ParentId: '2',
    parent: {
      Id: '2',
      Name: 'Corporate',
      ParentId: null,
      parent: null,
    },
  };

  const mockRootEntity: EntityWithParent = {
    Id: '2',
    Name: 'Corporate',
    ParentId: null,
    parent: null,
  };

  describe('getEntityPath', () => {
    it('should return empty string for null entity', () => {
      expect(getEntityPath(null)).toBe('');
      expect(getEntityPath(undefined)).toBe('');
    });

    it('should return single entity name for entity without parent', () => {
      expect(getEntityPath(mockRootEntity)).toBe('Corporate');
    });

    it('should return hierarchical path for entity with parent', () => {
      expect(getEntityPath(mockEntity)).toBe('Corporate > IT Department');
    });

    it('should use custom separator', () => {
      expect(getEntityPath(mockEntity, ' / ')).toBe(
        'Corporate / IT Department'
      );
    });
  });

  describe('getEntityDisplayLabel', () => {
    it('should return empty string for null entity', () => {
      expect(getEntityDisplayLabel(null)).toBe('');
    });

    it('should return full path by default', () => {
      expect(getEntityDisplayLabel(mockEntity)).toBe(
        'Corporate > IT Department'
      );
    });

    it('should return just entity name when showFullPath is false', () => {
      expect(getEntityDisplayLabel(mockEntity, false)).toBe('IT Department');
    });
  });

  describe('buildEntityPathFromArray', () => {
    const entities = [
      { Id: '1', Name: 'IT Department', ParentId: '2' },
      { Id: '2', Name: 'Corporate', ParentId: null },
      { Id: '3', Name: 'Security Team', ParentId: '1' },
    ];

    it('should return empty string for null entityId', () => {
      expect(buildEntityPathFromArray(null, entities)).toBe('');
    });

    it('should return empty string for empty entities array', () => {
      expect(buildEntityPathFromArray('1', [])).toBe('');
    });

    it('should build path from array', () => {
      expect(buildEntityPathFromArray('3', entities)).toBe(
        'Corporate > IT Department > Security Team'
      );
    });
  });

  describe('hasEntityHierarchy', () => {
    it('should return false for null entity', () => {
      expect(hasEntityHierarchy(null)).toBe(false);
    });

    it('should return false for entity without parent', () => {
      expect(hasEntityHierarchy(mockRootEntity)).toBe(false);
    });

    it('should return true for entity with parent', () => {
      expect(hasEntityHierarchy(mockEntity)).toBe(true);
    });
  });

  describe('getRootEntity', () => {
    it('should return null for null entity', () => {
      expect(getRootEntity(null)).toBeNull();
    });

    it('should return same entity if it is root', () => {
      expect(getRootEntity(mockRootEntity)).toEqual(mockRootEntity);
    });

    it('should return root entity for nested entity', () => {
      expect(getRootEntity(mockEntity)).toEqual(mockRootEntity);
    });
  });

  describe('formatEntityForDisplay', () => {
    it('should return empty string for null entity', () => {
      expect(formatEntityForDisplay(null)).toBe('');
    });

    it('should format with default prefix', () => {
      expect(formatEntityForDisplay(mockEntity)).toBe(
        'Entity: Corporate > IT Department'
      );
    });

    it('should use custom prefix', () => {
      expect(formatEntityForDisplay(mockEntity, { prefix: 'From: ' })).toBe(
        'From: Corporate > IT Department'
      );
    });

    it('should truncate long text', () => {
      const result = formatEntityForDisplay(mockEntity, { maxLength: 20 });
      expect(result).toHaveLength(20);
      expect(result).toMatch(/\.\.\.$/);
    });
  });
});
