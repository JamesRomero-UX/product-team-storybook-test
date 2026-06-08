import { buildEntity, insertEntity } from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('Entity', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('register', () => {
    it('should return empty array when no entities exist', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.entity.register.query();

      expect(response.entity).toEqual([]);
    });

    it('should return entities for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      await insertEntity(buildEntity(orgKey, userId));
      await insertEntity(
        buildEntity(orgKey, userId, { Name: 'Second Entity' })
      );

      const response = await trpcClient.frontend.entity.register.query();

      expect(response.entity).toHaveLength(2);
    });

    it('should return entity with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const entityInput = buildEntity(orgKey, userId, {
        Name: 'Risk Management',
        Description: 'Risk management entity',
        Weight: 2.5,
      });
      await insertEntity(entityInput);

      const response = await trpcClient.frontend.entity.register.query();

      expect(response.entity).toHaveLength(1);
      expect(response.entity[0]).toEqual(
        expect.objectContaining({
          Id: entityInput.Id,
          Name: 'Risk Management',
          Description: 'Risk management entity',
          Weight: 2.5,
        })
      );
    });

    it('should return createdByUser and modifiedByUser relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      await insertEntity(buildEntity(orgKey, userId));

      const response = await trpcClient.frontend.entity.register.query();

      expect(response.entity).toHaveLength(1);
      expect(response.entity[0]).toHaveProperty('createdByUser');
      expect(response.entity[0]).toHaveProperty('modifiedByUser');
    });

    it('should return owners relation', async () => {
      const { orgKey, userId, trpcClient } = context;

      await insertEntity(buildEntity(orgKey, userId));

      const response = await trpcClient.frontend.entity.register.query();

      expect(response.entity).toHaveLength(1);
      expect(response.entity[0]).toHaveProperty('owners');
    });

    it('should return children and parent relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentEntity = buildEntity(orgKey, userId, { Name: 'Parent' });
      await insertEntity(parentEntity);

      const childEntity = buildEntity(orgKey, userId, {
        Name: 'Child',
        ParentId: parentEntity.Id,
      });
      await insertEntity(childEntity);

      const response = await trpcClient.frontend.entity.register.query();

      expect(response.entity).toHaveLength(2);

      const parent = response.entity.find((e) => e.Id === parentEntity.Id);
      const child = response.entity.find((e) => e.Id === childEntity.Id);

      expect(parent?.children).toHaveLength(1);
      expect(parent?.children[0]?.Id).toBe(childEntity.Id);

      expect(child?.parent).toEqual(
        expect.objectContaining({
          Id: parentEntity.Id,
          Name: 'Parent',
        })
      );
    });
  });

  describe('getById', () => {
    it('should return entity by id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const entityInput = buildEntity(orgKey, userId, {
        Name: 'Specific Entity',
        Description: 'Find me by id',
      });
      await insertEntity(entityInput);

      const response = await trpcClient.frontend.entity.getById.query({
        id: entityInput.Id!,
      });

      expect(response).toEqual(
        expect.objectContaining({
          Id: entityInput.Id,
          Name: 'Specific Entity',
          Description: 'Find me by id',
        })
      );
    });

    it('should return null for non-existent id', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.entity.getById.query({
        id: randomUUID(),
      });

      expect(response).toBeNull();
    });

    it('should return createdByUser and modifiedByUser relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      const entityInput = buildEntity(orgKey, userId);
      await insertEntity(entityInput);

      const response = await trpcClient.frontend.entity.getById.query({
        id: entityInput.Id!,
      });

      expect(response).toHaveProperty('createdByUser');
      expect(response).toHaveProperty('modifiedByUser');
    });

    it('should return owners relation', async () => {
      const { orgKey, userId, trpcClient } = context;

      const entityInput = buildEntity(orgKey, userId);
      await insertEntity(entityInput);

      const response = await trpcClient.frontend.entity.getById.query({
        id: entityInput.Id!,
      });

      expect(response).toHaveProperty('owners');
    });

    it('should return parent relation when entity has a parent', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentEntity = buildEntity(orgKey, userId, { Name: 'Parent' });
      await insertEntity(parentEntity);

      const childEntity = buildEntity(orgKey, userId, {
        Name: 'Child',
        ParentId: parentEntity.Id,
      });
      await insertEntity(childEntity);

      const response = await trpcClient.frontend.entity.getById.query({
        id: childEntity.Id!,
      });

      expect(response?.parent).toEqual(
        expect.objectContaining({
          Id: parentEntity.Id,
          Name: 'Parent',
        })
      );
    });
  });
});
