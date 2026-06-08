import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildContributor } from '../data/contributor';
import { buildIssue } from '../data/issue';
import { buildObligation } from '../data/obligation';
import {
  anotherUser,
  publicUser1,
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

describe('contributor', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('Cannot query contributors directly', async () => {
      await expect(
        apiClient.getContributors(
          {},
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow("field 'contributor' not found in type: 'query_root'");
    });
  });

  describe('delete', () => {
    it('Cannot delete contributors directly', async () => {
      const obligation = buildObligation({
        contributors: {
          data: [buildContributor()],
        },
      });
      await apiClient.insertObligations({
        objects: obligation,
      });

      await expect(
        apiClient.deleteContributor(
          {
            Id: obligation.Id!,
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'delete_contributor' not found in type: 'mutation_root'"
      );
    });
  });

  describe('insert', () => {
    it.each([riskManagerUser1, publicUser1, standardUser1])(
      `$RoleKey cannot insert contributors directly`,
      async ({ ...user }) => {
        const issue = buildIssue({
          CreatedByUser: user.Id,
        });
        await apiClient.insertIssues({ objects: issue });

        await expect(
          apiClient.insertContributors(
            {
              objects: {
                ParentId: issue.Id,
                UserId: anotherUser.Id,
              },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_contributor' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
