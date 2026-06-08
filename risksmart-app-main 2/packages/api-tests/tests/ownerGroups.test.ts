import { randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteOwnerGroup,
  getOwnerGroups,
  insertOwnerGroup,
} from '../clients/ownerGroupsClient';
import { insertUserGroup } from '../clients/userGroupClient';
import { buildIssue } from '../data/issue';
import { buildUserGroup } from '../data/userGroup';
import type { UserGroupInsertInput } from '../generated/graphql';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('ownerGroups', () => {
  let userGroup: UserGroupInsertInput;

  beforeEach(async () => {
    await setup(mockedDefaults);
    userGroup = buildUserGroup({});
    await insertUserGroup(userGroup);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it(`Cannot query owner_groups directly`, async () => {
      await expect(
        getOwnerGroups({
          user: riskManagerUser1,
        })
      ).rejects.toThrow("field 'owner_group' not found in type: 'query_root'");
    });
  });

  describe('delete', () => {
    it(`Cannot delete owner_groups directly`, async () => {
      await expect(
        deleteOwnerGroup(
          {
            Id: randomUUID(),
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'delete_owner_group' not found in type: 'mutation_root'"
      );
    });
  });

  describe('insert', () => {
    it(`Cannot directly insert owner_groups`, async () => {
      const issue = buildIssue({
        CreatedByUser: riskManagerUser1.Id,
      });
      await apiClient.insertIssues({ objects: issue });
      await expect(
        insertOwnerGroup(
          {
            ParentId: issue.Id,
            UserGroupId: userGroup.Id,
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'insert_owner_group' not found in type: 'mutation_root'"
      );
    });
  });
});
