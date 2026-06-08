import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertDocument } from '../clients/documentClient';
import { buildDocument } from '../data/document';
import { buildIssue } from '../data/issue';
import { buildOwner } from '../data/owner';
import { anotherUser, riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('owner', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('Cannot query owners directly', async () => {
      await insertDocument(
        buildDocument({
          owners: {
            data: [buildOwner()],
          },
        })
      );

      await expect(
        apiClient.getOwners(
          {},
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow("field 'owner' not found in type: 'query_root'");
    });
  });

  describe('delete', () => {
    it('Cannot directly delete an owner', async () => {
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: anotherUser.Id })],
        },
      });
      await apiClient.insertDocument({ objects: document });

      await expect(
        apiClient.deleteOwner(
          {
            Id: document.Id!,
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'delete_owner' not found in type: 'mutation_root'"
      );
    });
  });

  describe('insert', () => {
    it(`Cannot directly insert owners`, async () => {
      const issue = buildIssue({
        CreatedByUser: riskManagerUser1.Id,
      });
      await apiClient.insertIssues({ objects: issue });
      await expect(
        apiClient.insertOwners(
          {
            objects: {
              ParentId: issue.Id,
              UserId: anotherUser.Id,
            },
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'insert_owner' not found in type: 'mutation_root'"
      );
    });
  });
});
