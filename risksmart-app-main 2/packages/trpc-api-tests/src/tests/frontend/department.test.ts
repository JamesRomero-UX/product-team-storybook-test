import {
  buildDepartmentType,
  insertDepartmentType,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('department', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('allTypes', () => {
    it('should return empty array when no department types exist', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toEqual([]);
    });

    it('should return department types for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentTypeInput = buildDepartmentType(orgKey, userId);
      await insertDepartmentType(departmentTypeInput);

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(1);
    });

    it('should return department type with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentTypeInput = buildDepartmentType(orgKey, userId, {
        Name: 'Engineering',
        Description: 'Engineering department',
      });
      const inserted = await insertDepartmentType(departmentTypeInput);

      if (!inserted) {
        throw new Error('Failed to insert department type');
      }

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          DepartmentTypeId: inserted.DepartmentTypeId,
          Name: 'Engineering',
          Description: 'Engineering department',
        })
      );
    });

    it('should return createdByUser and modifiedByUser relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentTypeInput = buildDepartmentType(orgKey, userId);
      await insertDepartmentType(departmentTypeInput);

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('createdByUser');
      expect(response[0]).toHaveProperty('modifiedByUser');
    });

    it('should return department_type_group relation', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentTypeInput = buildDepartmentType(orgKey, userId);
      await insertDepartmentType(departmentTypeInput);

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('department_type_group');
    });

    it('should return multiple department types', async () => {
      const { orgKey, userId, trpcClient } = context;

      const dept1 = buildDepartmentType(orgKey, userId, {
        Name: 'Engineering',
      });
      const dept2 = buildDepartmentType(orgKey, userId, {
        Name: 'Marketing',
      });

      await insertDepartmentType(dept1);
      await insertDepartmentType(dept2);

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(2);
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentTypeInput = buildDepartmentType(orgKey, userId);
      await insertDepartmentType(departmentTypeInput);

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });

    it('should return department type with null description', async () => {
      const { orgKey, userId, trpcClient } = context;

      const departmentTypeInput = buildDepartmentType(orgKey, userId, {
        Description: null,
      });
      await insertDepartmentType(departmentTypeInput);

      const response = await trpcClient.frontend.department.allTypes.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.Description).toBeNull();
    });
  });
});
