import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import {
  buildAction,
  buildActionUpdate,
  buildDepartmentType,
  buildTagType,
  insertAction,
  insertActionUpdate,
  insertDepartmentType,
  insertTagType,
} from '@risksmart-app/test-data';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('action', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  let context: Awaited<ReturnType<typeof createTestContext>>;

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  it('actionById query should return correct data', async () => {
    const { orgKey, userId, trpcClient } = context;

    const { Meta, OrgKey, ...insertedActionProps } = buildAction(
      orgKey,
      userId
    );
    await insertAction({ Meta, OrgKey, ...insertedActionProps });

    const response = await trpcClient.frontend.action.actionById.query({
      id: insertedActionProps.Id!,
    });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        ...insertedActionProps,
        ancestorContributors: [],
        contributorGroups: [],
        contributors: [],
        departments: [],
        files: [],
        ownerGroups: [],
        owners: [],
        tags: [],
      })
    );
  });

  it('register query should return correct data', async () => {
    const { orgKey, userId, trpcClient } = context;

    const { Meta, OrgKey, ...insertedActionProps } = buildAction(
      orgKey,
      userId
    );
    await insertAction({ Meta, OrgKey, ...insertedActionProps });
    await insertAction(buildAction(orgKey, userId));

    const response = await trpcClient.frontend.action.register.query({});

    expect(response.action.length).toEqual(2);
    expect(response.action).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...insertedActionProps,
          contributorGroups: [],
          contributors: [],
          departments: [],
          ownerGroups: [],
          owners: [],
          tags: [],
        }),
      ])
    );
  });

  describe('insert', () => {
    it('should insert an action with required fields only', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.action.insert.mutate({
        Title: 'Required fields only',
        DateDue: '2025-01-01T00:00:00.000Z',
        DateRaised: '2025-01-01T00:00:00.000Z',
        Status: ActionStatus.Open,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an action with all optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.action.insert.mutate({
        Title: 'All optional fields',
        DateDue: '2025-06-30T00:00:00.000Z',
        DateRaised: '2025-01-01T00:00:00.000Z',
        Status: ActionStatus.Pending,
        Priority: 2,
        Description: 'A detailed description of the action',
        ClosedDate: '2025-06-30T00:00:00.000Z',
        CustomAttributeData: { customField: 'value', number: 42 },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an action with null optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.action.insert.mutate({
        Title: 'Null optional fields',
        DateDue: '2025-01-01T00:00:00.000Z',
        DateRaised: '2025-01-01T00:00:00.000Z',
        Status: ActionStatus.Open,
        ParentId: null,
        Priority: null,
        Description: null,
        ClosedDate: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an action with a valid parent', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentAction = buildAction(orgKey, userId);
      await insertAction(parentAction);

      const response = await trpcClient.frontend.action.insert.mutate({
        Title: 'Child action with parent',
        DateDue: '2025-01-01T00:00:00.000Z',
        DateRaised: '2025-01-01T00:00:00.000Z',
        Status: ActionStatus.Open,
        ParentId: parentAction.Id!,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an action with relationship arrays', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.action.insert.mutate({
        Title: 'Action with relationships',
        DateDue: '2025-01-01T00:00:00.000Z',
        DateRaised: '2025-01-01T00:00:00.000Z',
        Status: ActionStatus.Open,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
        OwnerGroupIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();
    });

    it('should persist tags and departments when TagTypeIds and DepartmentTypeIds are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Action Tag' })
      );
      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Action Department' })
      );

      const response = await trpcClient.frontend.action.insert.mutate({
        Title: 'Action with tags and departments',
        DateDue: '2025-01-01T00:00:00.000Z',
        DateRaised: '2025-01-01T00:00:00.000Z',
        Status: ActionStatus.Open,
        TagTypeIds: [tagType!.TagTypeId],
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const actions = await trpcClient.frontend.action.actionById.query({
        id: response.Id,
      });
      expect(actions).toHaveLength(1);
      expect(actions[0]?.tags).toHaveLength(1);
      expect(actions[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
      expect(actions[0]?.departments).toHaveLength(1);
      expect(actions[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });

    it('should reject insert with an empty title', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.action.insert.mutate({
          Title: '',
          DateDue: '2025-01-01T00:00:00.000Z',
          DateRaised: '2025-01-01T00:00:00.000Z',
          Status: ActionStatus.Open,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid ParentId UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.action.insert.mutate({
          Title: 'Valid title',
          DateDue: '2025-01-01T00:00:00.000Z',
          DateRaised: '2025-01-01T00:00:00.000Z',
          Status: ActionStatus.Open,
          ParentId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
        })
      ).rejects.toThrow();
    });
  });

  describe('action updates', () => {
    describe('insert action update', () => {
      it('should insert a new action update', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create parent action
        const parentAction = buildAction(orgKey, userId);
        await insertAction(parentAction);

        const response = await trpcClient.frontend.action.updates.insert.mutate(
          {
            ParentActionId: parentAction.Id!,
            Title: 'Test Action Update',
            Description: 'Test update description',
          }
        );

        // Async request returns an ID immediately
        expect(response.Id).toBeDefined();
      });

      it('should insert action update with custom attribute data', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create parent action
        const parentAction = buildAction(orgKey, userId);
        await insertAction(parentAction);

        const response = await trpcClient.frontend.action.updates.insert.mutate(
          {
            ParentActionId: parentAction.Id!,
            Title: 'Test Action Update',
            Description: 'Test update description',
            CustomAttributeData: { field: 'value' },
          }
        );

        expect(response.Id).toBeDefined();
      });
    });

    describe('delete action updates', () => {
      it('should delete action updates successfully', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create parent action
        const parentAction = buildAction(orgKey, userId);
        await insertAction(parentAction);

        // Create multiple action updates via direct DB insert (bypasses async request flow)
        const update1 = buildActionUpdate({
          orgKey,
          userId,
          actionId: parentAction.Id!,
          overrides: { Title: 'Update 1', Description: 'Description 1' },
        });
        const update2 = buildActionUpdate({
          orgKey,
          userId,
          actionId: parentAction.Id!,
          overrides: { Title: 'Update 2', Description: 'Description 2' },
        });
        await insertActionUpdate(update1);
        await insertActionUpdate(update2);

        // Delete both updates - returns void on success
        const response = await trpcClient.frontend.action.updates.delete.mutate(
          {
            ids: [update1.Id!, update2.Id!],
          }
        );

        // Delete returns empty string on success (HTTP 204 with empty body)
        expect(response).toBe('');
      });

      it('should handle single action update deletion', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create parent action
        const parentAction = buildAction(orgKey, userId);
        await insertAction(parentAction);

        // Create action update via direct DB insert (bypasses async request flow)
        const update = buildActionUpdate({
          orgKey,
          userId,
          actionId: parentAction.Id!,
          overrides: { Title: 'Update to delete', Description: 'Description' },
        });
        await insertActionUpdate(update);

        // Delete single update - returns void on success
        const response = await trpcClient.frontend.action.updates.delete.mutate(
          {
            ids: [update.Id!],
          }
        );

        // Delete returns empty string on success (HTTP 204 with empty body)
        expect(response).toBe('');
      });

      it('should reject deletion with invalid IDs format', async () => {
        const { trpcClient } = context;

        // Try to delete with invalid UUID format
        await expect(
          trpcClient.frontend.action.updates.delete.mutate({
            ids: ['not-a-uuid'],
          })
        ).rejects.toThrow();
      });

      it('should reject deletion with empty IDs array', async () => {
        const { trpcClient } = context;

        // Try to delete with empty array
        await expect(
          trpcClient.frontend.action.updates.delete.mutate({
            ids: [],
          })
        ).rejects.toThrow();
      });
    });
  });
});
