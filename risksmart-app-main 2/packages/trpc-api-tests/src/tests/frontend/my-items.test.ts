import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import {
  buildAction,
  buildOwner,
  insertAction,
  insertOwner,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

const allOwnershipTrue = {
  owner: true,
  contributor: true,
  groupOwner: true,
  groupContributor: true,
  inheritedOwner: true,
  inheritedContributor: true,
  inheritedGroupOwner: true,
  inheritedGroupContributor: true,
};

const allOwnershipFalse = {
  owner: false,
  contributor: false,
  groupOwner: false,
  groupContributor: false,
  inheritedOwner: false,
  inheritedContributor: false,
  inheritedGroupOwner: false,
  inheritedGroupContributor: false,
};

describe('myItems', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('dueItems', () => {
    it('should return empty arrays when no data exists', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.myItems.dueItems.query({
        date: new Date().toISOString(),
        userId,
        ownershipFilter: allOwnershipTrue,
      });

      expect(response.action).toEqual([]);
      expect(response.assessment).toEqual([]);
      expect(response.control).toEqual([]);
      expect(response.document).toEqual([]);
      expect(response.issue).toEqual([]);
      expect(response.obligation).toEqual([]);
      expect(response.risk).toEqual([]);
      expect(response.attestationRecord).toEqual([]);
      expect(response.assessmentActivity).toEqual([]);
      expect(response.changeRequest).toEqual([]);
    });

    it('should return a due action when action has a past due date and user is owner', async () => {
      const { orgKey, userId, trpcClient } = context;

      const actionInput = buildAction(orgKey, userId, {
        DateDue: '2024-01-01T00:00:00Z',
        Status: ActionStatus.Open,
      });
      const insertedAction = await insertAction(actionInput);

      if (!insertedAction) {
        throw new Error('Failed to insert action');
      }

      await insertOwner(
        buildOwner({
          orgKey,
          parentId: insertedAction.Id,
          userId,
          createdByUser: userId,
        })
      );

      const response = await trpcClient.frontend.myItems.dueItems.query({
        date: new Date().toISOString(),
        userId,
        ownershipFilter: { ...allOwnershipFalse, owner: true },
      });

      expect(response.action).toHaveLength(1);
      expect(response.action[0]).toEqual(
        expect.objectContaining({
          Id: insertedAction.Id,
          Title: actionInput.Title,
        })
      );
    });

    it('should not return a closed action', async () => {
      const { orgKey, userId, trpcClient } = context;

      const actionInput = buildAction(orgKey, userId, {
        DateDue: '2024-01-01T00:00:00Z',
        Status: ActionStatus.Closed,
      });
      const insertedAction = await insertAction(actionInput);

      if (!insertedAction) {
        throw new Error('Failed to insert action');
      }

      await insertOwner(
        buildOwner({
          orgKey,
          parentId: insertedAction.Id,
          userId,
          createdByUser: userId,
        })
      );

      const response = await trpcClient.frontend.myItems.dueItems.query({
        date: new Date().toISOString(),
        userId,
        ownershipFilter: { ...allOwnershipFalse, owner: true },
      });

      expect(response.action).toEqual([]);
    });

    it('should not return an action with a future due date', async () => {
      const { orgKey, userId, trpcClient } = context;

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const actionInput = buildAction(orgKey, userId, {
        DateDue: futureDate.toISOString(),
        Status: ActionStatus.Open,
      });
      const insertedAction = await insertAction(actionInput);

      if (!insertedAction) {
        throw new Error('Failed to insert action');
      }

      await insertOwner(
        buildOwner({
          orgKey,
          parentId: insertedAction.Id,
          userId,
          createdByUser: userId,
        })
      );

      const response = await trpcClient.frontend.myItems.dueItems.query({
        date: new Date().toISOString(),
        userId,
        ownershipFilter: { ...allOwnershipFalse, owner: true },
      });

      expect(response.action).toEqual([]);
    });

    it('should not return items when all ownership filters are false', async () => {
      const { orgKey, userId, trpcClient } = context;

      const actionInput = buildAction(orgKey, userId, {
        DateDue: '2024-01-01T00:00:00Z',
        Status: ActionStatus.Open,
      });
      const insertedAction = await insertAction(actionInput);

      if (!insertedAction) {
        throw new Error('Failed to insert action');
      }

      await insertOwner(
        buildOwner({
          orgKey,
          parentId: insertedAction.Id,
          userId,
          createdByUser: userId,
        })
      );

      const response = await trpcClient.frontend.myItems.dueItems.query({
        date: new Date().toISOString(),
        userId,
        ownershipFilter: allOwnershipFalse,
      });

      expect(response.action).toEqual([]);
    });

    it('should return response with all expected entity keys', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.myItems.dueItems.query({
        date: new Date().toISOString(),
        userId,
        ownershipFilter: allOwnershipTrue,
      });

      expect(response).toHaveProperty('action');
      expect(response).toHaveProperty('assessment');
      expect(response).toHaveProperty('assessmentActivity');
      expect(response).toHaveProperty('attestationRecord');
      expect(response).toHaveProperty('changeRequest');
      expect(response).toHaveProperty('control');
      expect(response).toHaveProperty('document');
      expect(response).toHaveProperty('issue');
      expect(response).toHaveProperty('obligation');
      expect(response).toHaveProperty('risk');
    });
  });
});
