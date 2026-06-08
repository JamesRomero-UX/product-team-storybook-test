import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildAction } from '../data/action';
import { buildContributor } from '../data/contributor';
import { buildTag } from '../data/tag';
import { buildTagType } from '../data/tagType';
import type { TagTypeInsertInput } from '../generated/graphql';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('tags', () => {
  let tagType: TagTypeInsertInput;

  beforeEach(async () => {
    await setup(mockedDefaults);
    tagType = buildTagType();
    await apiClient.insertTagTypes({
      objects: [tagType],
    });
  }, 10000);

  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('Cannot query tags directly', async () => {
      await expect(
        apiClient.getAllTags(
          {},
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow("field 'tag' not found in type: 'query_root'");
    });
  });

  describe('insert', () => {
    it('Cannot insert tags directly', async () => {
      const action = buildAction({
        contributors: {
          data: [buildContributor({ UserId: riskManagerUser1.Id })],
        },
      });
      await apiClient.insertActions({ objects: action });

      await expect(
        apiClient.insertTags(
          {
            objects: buildTag({
              TagTypeId: tagType.TagTypeId,
              ParentId: action.Id,
              OrgKey: undefined,
              ModifiedByUser: undefined,
              CreatedByUser: undefined,
            }),
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'insert_tag' not found in type: 'mutation_root'"
      );
    });
  });

  describe('delete', () => {
    it('Cannot delete tags directly', async () => {
      const action = buildAction({
        contributors: {
          data: [buildContributor({ UserId: riskManagerUser1.Id })],
        },
        tags: {
          data: [
            buildTag({
              TagTypeId: tagType.TagTypeId,
            }),
          ],
        },
      });
      await apiClient.insertActions({ objects: action });

      await expect(
        apiClient.deleteTag(
          { parentId: action.Id! },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'delete_tag' not found in type: 'mutation_root'"
      );
    });
  });
});
