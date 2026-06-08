import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { buildAction } from '../data/action';
import { buildContributor } from '../data/contributor';
import { buildDepartment } from '../data/department';
import { buildDepartmentType } from '../data/departmentType';
import type { DepartmentTypeInsertInput } from '../generated/graphql';
import { riskManagerUser1, setup, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('departments', () => {
  let departmentType: DepartmentTypeInsertInput;

  beforeEach(async () => {
    await setup(mockedDefaults);
    departmentType = buildDepartmentType();
    await apiClient.insertDepartmentTypes({
      objects: [departmentType],
    });
  }, 10000);

  afterEach(async () => {
    await teardown();
  });

  it('Inserting a department type creates an associated node record', async () => {
    const results = await apiClient.getNodes({ orgKey: getDefaultOrgId() });
    const departmentTypeNode = results.node.find(
      (n) => n.Id === departmentType.DepartmentTypeId
    );
    expect(departmentTypeNode).toBeDefined();
    expect(departmentTypeNode?.ObjectType).toEqual('department_type');
  });

  it('Deleting a department deletes the associated node record', async () => {
    await apiClient.deleteDepartmentType({
      tagTypeId: departmentType.DepartmentTypeId!,
    });
    const results = await apiClient.getNodes({ orgKey: getDefaultOrgId() });
    const departmentTypeNode = results.node.find(
      (n) => n.Id === departmentType.DepartmentTypeId
    );
    expect(departmentTypeNode).toBeUndefined();
  });

  describe('query', () => {
    it('Cannot query departments directly', async () => {
      await expect(
        apiClient.getAllDepartment(
          {},
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow("field 'department' not found in type: 'query_root'");
    });
  });

  describe('insert', () => {
    it('Cannot insert departments directly', async () => {
      const action = buildAction({
        contributors: {
          data: [buildContributor({ UserId: riskManagerUser1.Id })],
        },
      });
      await apiClient.insertActions({ objects: action });

      await expect(
        apiClient.insertDepartments(
          {
            objects: buildDepartment({
              DepartmentTypeId: departmentType.DepartmentTypeId,
              ParentId: action.Id,
              OrgKey: undefined,
              ModifiedByUser: undefined,
              CreatedByUser: undefined,
            }),
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'insert_department' not found in type: 'mutation_root'"
      );
    });
  });

  describe('delete', () => {
    it('Cannot delete departments directly', async () => {
      const action = buildAction({
        contributors: {
          data: [buildContributor({ UserId: riskManagerUser1.Id })],
        },
        departments: {
          data: [
            buildDepartment({
              DepartmentTypeId: departmentType.DepartmentTypeId,
            }),
          ],
        },
      });
      await apiClient.insertActions({ objects: action });

      await expect(
        apiClient.deleteDepartment(
          { parentId: action.Id! },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        "field 'delete_department' not found in type: 'mutation_root'"
      );
    });
  });
});
