import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { buildTagType } from '../data/tagType';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('tagType', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 10000);

  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('Inserting a tag type creates an associated node record', async () => {
      const tagType = buildTagType();
      await apiClient.insertTagTypes({
        objects: [tagType],
      });

      const results = await apiClient.getNodes({ orgKey: getDefaultOrgId() });
      const tagNode = results.node.find((n) => n.Id === tagType.TagTypeId);
      expect(tagNode).toBeDefined();
      expect(tagNode?.ObjectType).toEqual('tag_type');
    });

    it('Deleting a tag type deletes the associated node record', async () => {
      const tagType = buildTagType();
      await apiClient.insertTagTypes({
        objects: [tagType],
      });
      await apiClient.deleteTagType({ tagTypeId: tagType.TagTypeId! });
      const results = await apiClient.getNodes({ orgKey: getDefaultOrgId() });
      const tagNode = results.node.find((n) => n.Id === tagType.TagTypeId);
      expect(tagNode).toBeUndefined();
    });

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      internalAuditUser1,
    ])("$RoleKey should see there organization's tag types", async () => {
      const tagType = buildTagType();
      await apiClient.insertTagTypes({
        objects: [tagType],
      });

      const tagTypes = await apiClient.getAllTagTypes(
        {},
        {
          user: riskManagerUser1,
        }
      );
      expect(tagTypes.tag_type.length).toEqual(1);
      expect(tagTypes.tag_type[0].TagTypeId).toEqual(tagType.TagTypeId);
    });
  });
});
