import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getDepartmentType, getOrAddDepartmentType } from './department';

vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('getDepartmentType', () => {
  const mockedApiClient = mock<Sdk>({
    getDepartmentTypesByName: vi.fn(),
  });

  const mockDepartmentName = 'Test Department';
  const mockDepartmentId = 'dept-123';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('when department name is invalid', () => {
    it('should throw BadRequest error for empty string', async () => {
      await expect(getDepartmentType(mockedApiClient, '')).rejects.toThrow(
        'Department name is required'
      );
    });

    it('should throw BadRequest error for null/undefined', async () => {
      await expect(
        getDepartmentType(mockedApiClient, null as unknown as string)
      ).rejects.toThrow('Department name is required');
      await expect(
        getDepartmentType(mockedApiClient, undefined as unknown as string)
      ).rejects.toThrow('Department name is required');
    });
  });

  describe('when department exists', () => {
    beforeEach(() => {
      vi.mocked(mockedApiClient.getDepartmentTypesByName).mockResolvedValue({
        department_type: [
          {
            DepartmentTypeId: mockDepartmentId,
            Name: mockDepartmentName,
          },
        ],
      });
    });

    it('should return department ID', async () => {
      const result = await getDepartmentType(
        mockedApiClient,
        mockDepartmentName
      );

      expect(result).toBe(mockDepartmentId);
    });

    it('should return department ID when throwIfNotFound is false', async () => {
      const result = await getDepartmentType(
        mockedApiClient,
        mockDepartmentName,
        false
      );

      expect(result).toBe(mockDepartmentId);
    });
  });

  describe('when department does not exist', () => {
    beforeEach(() => {
      vi.mocked(mockedApiClient.getDepartmentTypesByName).mockResolvedValue({
        department_type: [],
      });
    });

    it('should throw NotFound error by default', async () => {
      await expect(
        getDepartmentType(mockedApiClient, mockDepartmentName)
      ).rejects.toThrow('Department type not found');
    });

    it('should throw NotFound error when throwIfNotFound is true', async () => {
      await expect(
        getDepartmentType(mockedApiClient, mockDepartmentName, true)
      ).rejects.toThrow('Department type not found');
    });

    it('should return null when throwIfNotFound is false', async () => {
      const result = await getDepartmentType(
        mockedApiClient,
        mockDepartmentName,
        false
      );

      expect(result).toBeNull();
    });
  });
});

describe('getOrAddDepartmentType', () => {
  const mockedApiClient = mock<Sdk>({
    getDepartmentTypesByName: vi.fn(),
    insertDepartmentTypeWithOptionalGroupId: vi.fn(),
  });

  const mockDepartmentName = 'Test Department';
  const mockDepartmentId = 'dept-123';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('when department name is invalid', () => {
    it('should throw BadRequest error for empty string', async () => {
      await expect(getOrAddDepartmentType(mockedApiClient, '')).rejects.toThrow(
        'Department name is required'
      );
    });

    it('should throw BadRequest error for null/undefined', async () => {
      await expect(
        getOrAddDepartmentType(mockedApiClient, null as unknown as string)
      ).rejects.toThrow('Department name is required');
      await expect(
        getOrAddDepartmentType(mockedApiClient, undefined as unknown as string)
      ).rejects.toThrow('Department name is required');
    });
  });

  describe('when department already exists', () => {
    beforeEach(() => {
      vi.mocked(mockedApiClient.getDepartmentTypesByName).mockResolvedValue({
        department_type: [
          {
            DepartmentTypeId: mockDepartmentId,
            Name: mockDepartmentName,
          },
        ],
      });
    });

    it('should return existing department ID', async () => {
      const result = await getOrAddDepartmentType(
        mockedApiClient,
        mockDepartmentName
      );

      expect(result).toBe(mockDepartmentId);
      expect(mockedApiClient.getDepartmentTypesByName).toHaveBeenCalledWith({
        Name: mockDepartmentName,
      });
      expect(
        mockedApiClient.insertDepartmentTypeWithOptionalGroupId
      ).not.toHaveBeenCalled();
    });

    it('should handle multiple existing departments by returning the first one', async () => {
      const secondDepartmentId = 'dept-456';
      vi.mocked(mockedApiClient.getDepartmentTypesByName).mockResolvedValue({
        department_type: [
          {
            DepartmentTypeId: mockDepartmentId,
            Name: mockDepartmentName,
          },
          {
            DepartmentTypeId: secondDepartmentId,
            Name: mockDepartmentName,
          },
        ],
      });

      const result = await getOrAddDepartmentType(
        mockedApiClient,
        mockDepartmentName
      );

      expect(result).toBe(mockDepartmentId);
    });
  });

  describe('when department does not exist', () => {
    beforeEach(() => {
      vi.mocked(mockedApiClient.getDepartmentTypesByName).mockResolvedValue({
        department_type: [],
      });
    });

    it('should create new department and return its ID', async () => {
      vi.mocked(
        mockedApiClient.insertDepartmentTypeWithOptionalGroupId
      ).mockResolvedValue({
        insert_department_type_one: {
          DepartmentTypeId: 'new-dept-123',
        },
      });

      const result = await getOrAddDepartmentType(
        mockedApiClient,
        mockDepartmentName
      );

      expect(result).toBe('new-dept-123');
      expect(mockedApiClient.getDepartmentTypesByName).toHaveBeenCalledWith({
        Name: mockDepartmentName,
      });
      expect(
        mockedApiClient.insertDepartmentTypeWithOptionalGroupId
      ).toHaveBeenCalledWith({
        Name: mockDepartmentName,
        Description: 'Department type added via Jira integration',
      });
    });

    it('should throw BadRequest error when insertion fails', async () => {
      vi.mocked(
        mockedApiClient.insertDepartmentTypeWithOptionalGroupId
      ).mockResolvedValue({
        insert_department_type_one: null,
      });

      await expect(
        getOrAddDepartmentType(mockedApiClient, mockDepartmentName)
      ).rejects.toThrow('Failed to add new department type');
    });

    it('should handle insertion returning undefined', async () => {
      vi.mocked(
        mockedApiClient.insertDepartmentTypeWithOptionalGroupId
      ).mockResolvedValue({
        insert_department_type_one: undefined,
      });

      await expect(
        getOrAddDepartmentType(mockedApiClient, mockDepartmentName)
      ).rejects.toThrow('Failed to add new department type');
    });
  });
});
