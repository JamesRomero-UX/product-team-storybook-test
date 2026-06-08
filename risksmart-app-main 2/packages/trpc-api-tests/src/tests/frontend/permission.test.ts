import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('permission', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('bulkCheck', () => {
    it('should return permitted checks', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.permission.bulkCheck.query([
        {
          resourceName: 'rs_node',
          action: 'read',
        },
      ]);

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          resourceName: 'rs_node',
          action: 'read',
        })
      );
    });

    it('should return multiple permitted checks', async () => {
      const { trpcClient } = context;

      const checks = [
        { resourceName: 'rs_node', action: 'read' as const },
        { resourceName: 'rs_node', action: 'insert' as const },
        { resourceName: 'rs_node', action: 'update' as const },
        { resourceName: 'rs_node', action: 'delete' as const },
      ];

      const response =
        await trpcClient.frontend.permission.bulkCheck.query(checks);

      expect(response).toHaveLength(4);
    });

    it('should handle check with resourceId', async () => {
      const { trpcClient } = context;

      const resourceId = crypto.randomUUID();
      const response = await trpcClient.frontend.permission.bulkCheck.query([
        {
          resourceName: 'rs_node',
          resourceId,
          action: 'read',
        },
      ]);

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          resourceName: 'rs_node',
          resourceId,
          action: 'read',
        })
      );
    });

    it('should return empty array when given empty input', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.permission.bulkCheck.query([]);

      expect(response).toEqual([]);
    });
  });

  describe('checkNavigationVisibility', () => {
    it('should return visibility for a single parent type', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.permission.checkNavigationVisibility.query({
          parentTypes: [ParentTypes.Risk],
        });

      expect(response).toHaveLength(1);
      expect(response[0]?.parentType).toBe(ParentTypes.Risk);
      expect(typeof response[0]?.visible).toBe('boolean');
    });

    it('should return visibility for multiple parent types', async () => {
      const { trpcClient } = context;

      const parentTypes = [
        ParentTypes.Risk,
        ParentTypes.Control,
        ParentTypes.Issue,
      ];

      const response =
        await trpcClient.frontend.permission.checkNavigationVisibility.query({
          parentTypes,
        });

      expect(response).toHaveLength(3);
      const returnedParentTypes = response.map((r) => r.parentType);
      expect(returnedParentTypes).toContain(ParentTypes.Risk);
      expect(returnedParentTypes).toContain(ParentTypes.Control);
      expect(returnedParentTypes).toContain(ParentTypes.Issue);
    });

    it('should return empty array for empty parent types input', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.permission.checkNavigationVisibility.query({
          parentTypes: [],
        });

      expect(response).toEqual([]);
    });

    it('should return visible false when user has no roles', async () => {
      // createTestContext creates a user but does not assign roles,
      // so user has no roles in permit. However the stub PDP always
      // allows, so we verify the service still returns a result.
      // The key check is: the service queries user roles from the DB,
      // and if no roles exist it returns visible: false for all types.
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.permission.checkNavigationVisibility.query({
          parentTypes: [ParentTypes.Risk],
        });

      expect(response).toHaveLength(1);
      // User has no roles assigned, so the service returns false
      // before even reaching the PDP
      expect(response[0]?.visible).toBe(false);
    });
  });
});
