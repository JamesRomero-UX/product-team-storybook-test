import {
  buildControlGroup,
  getControlGroupById,
  insertControlGroup,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('control-group', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('control groups', () => {
    describe('get control groups', () => {
      it('should return empty list when no control groups exist', async () => {
        const { trpcClient } = context;

        const response =
          await trpcClient.frontend.controlGroup.controlGroups.query();

        expect(response).toEqual([]);
      });

      it('should return all control groups the user has access to', async () => {
        const { orgKey, userId, trpcClient } = context;

        const controlGroupInput = buildControlGroup({
          orgKey,
          userId,
        });
        const insertedControlGroup =
          await insertControlGroup(controlGroupInput);

        if (!insertedControlGroup) {
          throw new Error('Failed to insert control group');
        }

        const response =
          await trpcClient.frontend.controlGroup.controlGroups.query();

        expect(response.length).toEqual(1);
        expect(response[0]).toEqual(
          expect.objectContaining({
            Id: insertedControlGroup.Id,
            Title: controlGroupInput.Title,
            Description: controlGroupInput.Description,
            Owner: controlGroupInput.Owner,
          })
        );
      });

      it('should return control groups ordered by title ascending', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Insert control groups with different titles
        const controlGroupA = buildControlGroup({
          orgKey,
          userId,
          overrides: { Title: 'Alpha Control Group' },
        });
        const controlGroupZ = buildControlGroup({
          orgKey,
          userId,
          overrides: { Title: 'Zeta Control Group' },
        });
        const controlGroupM = buildControlGroup({
          orgKey,
          userId,
          overrides: { Title: 'Mike Control Group' },
        });

        // Insert in non-alphabetical order
        await insertControlGroup(controlGroupZ);
        await insertControlGroup(controlGroupA);
        await insertControlGroup(controlGroupM);

        const response =
          await trpcClient.frontend.controlGroup.controlGroups.query();

        expect(response.length).toEqual(3);
        // Verify ordering by title ascending
        expect(response[0]?.Title).toEqual('Alpha Control Group');
        expect(response[1]?.Title).toEqual('Mike Control Group');
        expect(response[2]?.Title).toEqual('Zeta Control Group');
      });

      it('should return multiple control groups', async () => {
        const { orgKey, userId, trpcClient } = context;

        const controlGroup1 = buildControlGroup({
          orgKey,
          userId,
          overrides: { Title: 'Control Group 1' },
        });
        const controlGroup2 = buildControlGroup({
          orgKey,
          userId,
          overrides: { Title: 'Control Group 2' },
        });

        await insertControlGroup(controlGroup1);
        await insertControlGroup(controlGroup2);

        const response =
          await trpcClient.frontend.controlGroup.controlGroups.query();

        expect(response.length).toEqual(2);
        expect(response.map((cg) => cg.Title)).toContain('Control Group 1');
        expect(response.map((cg) => cg.Title)).toContain('Control Group 2');
      });

      it('should not return OrgKey and Meta fields', async () => {
        const { orgKey, userId, trpcClient } = context;

        const controlGroupInput = buildControlGroup({
          orgKey,
          userId,
        });
        await insertControlGroup(controlGroupInput);

        const response =
          await trpcClient.frontend.controlGroup.controlGroups.query();

        expect(response.length).toEqual(1);
        // OrgKey and Meta should be excluded based on the controlGroup fragment
        expect(response[0]).not.toHaveProperty('OrgKey');
        expect(response[0]).not.toHaveProperty('Meta');
      });

      it('should return control group with custom attribute data', async () => {
        const { orgKey, userId, trpcClient } = context;

        const customData = { customField: 'customValue' };
        const controlGroupInput = buildControlGroup({
          orgKey,
          userId,
          overrides: {
            CustomAttributeData: customData,
          },
        });
        await insertControlGroup(controlGroupInput);

        const response =
          await trpcClient.frontend.controlGroup.controlGroups.query();

        expect(response.length).toEqual(1);
        expect(response[0]?.CustomAttributeData).toEqual(customData);
      });
    });

    describe('insert control group', () => {
      it('should insert a new control group', async () => {
        const { trpcClient } = context;

        const response = await trpcClient.frontend.controlGroup.insert.mutate({
          Title: 'New Control Group',
          Description: 'Description of new control group',
          Owner: context.userId,
        });

        expect(response.Id).toBeDefined();
      });

      it('should insert control group with custom attribute data', async () => {
        const { trpcClient } = context;

        const response = await trpcClient.frontend.controlGroup.insert.mutate({
          Title: 'Control Group with Custom Data',
          Description: 'Description with custom attributes',
          Owner: context.userId,
          CustomAttributeData: {
            customField: 'customValue',
            riskLevel: 'high',
          },
        });

        expect(response.Id).toBeDefined();
      });

      it('should reject insertion with empty title', async () => {
        const { trpcClient } = context;

        await expect(
          trpcClient.frontend.controlGroup.insert.mutate({
            Title: '',
            Description: 'Description',
            Owner: context.userId,
          })
        ).rejects.toThrow();
      });

      it('should reject insertion with title exceeding max length', async () => {
        const { trpcClient } = context;

        const longTitle = 'a'.repeat(256); // Max is 255

        await expect(
          trpcClient.frontend.controlGroup.insert.mutate({
            Title: longTitle,
            Description: 'Description',
            Owner: context.userId,
          })
        ).rejects.toThrow();
      });
    });

    describe('delete control group', () => {
      it('should delete a control group', async () => {
        const { orgKey, userId, trpcClient } = context;

        const controlGroupInput = buildControlGroup({
          orgKey,
          userId,
        });
        const insertedControlGroup =
          await insertControlGroup(controlGroupInput);

        if (!insertedControlGroup) {
          throw new Error('Failed to insert control group');
        }

        await trpcClient.frontend.controlGroup.delete.mutate({
          id: insertedControlGroup.Id,
          originalTimestamp: insertedControlGroup.ModifiedAtTimestamp,
        });

        const controlGroup = await getControlGroupById(insertedControlGroup.Id);

        expect(controlGroup).toBeUndefined();
      });
    });
  });
});
