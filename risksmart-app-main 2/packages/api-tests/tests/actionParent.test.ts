import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildAction } from '../data/action';
import { buildActionParent } from '../data/actionParent';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildOwner } from '../data/owner';
import { ParentTypeEnum } from '../generated/graphql';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
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

describe('actionParent', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords action parents where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            actions: {
              data: [
                buildActionParent({
                  action: { data: buildAction() },
                  ParentType: ParentTypeEnum.Control,
                }),
              ],
            },
          }),
        });

        const result = await apiClient.getActionParents(
          {},
          {
            user,
          }
        );
        expect(result.action_parent.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords action parents where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            actions: {
              data: [
                buildActionParent({
                  action: { data: buildAction() },
                  ParentType: ParentTypeEnum.Control,
                }),
              ],
            },
          }),
        });

        const result = await apiClient.getActionParents(
          {},
          {
            user,
          }
        );
        expect(result.action_parent.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords action parents where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            actions: {
              data: [
                buildActionParent({
                  action: { data: buildAction() },
                  ParentType: ParentTypeEnum.Control,
                }),
              ],
            },
          }),
        });

        const result = await apiClient.getActionParents(
          {},
          {
            user,
          }
        );
        expect(result.action_parent.length).toEqual(expectedRecords);
      }
    );
  });
});
