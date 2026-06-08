import { BadRequest, NotFound } from 'http-errors';
import { getLogger } from 'src/logger';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';

const logger = getLogger();

/**
 * Retrieves the department type ID by department name.
 * @param apiClient - The API client to interact with the backend.
 * @param departmentName - The name of the department.
 * @param throwIfNotFound - If true (default), throws NotFound when the department does not exist. If false, returns null instead.
 * @returns The ID of the department type, or null when `throwIfNotFound` is false and the department does not exist.
 * @throws BadRequest if the department name is empty.
 * @throws NotFound if the department type is not found and `throwIfNotFound` is true.
 */
export const getDepartmentType = async (
  apiClient: Sdk,
  departmentName: string,
  throwIfNotFound = true
): Promise<string | null> => {
  if (!departmentName || departmentName.trim().length === 0) {
    logger.error('Department name is empty, cannot retrieve department type');
    throw new BadRequest('Department name is required');
  }

  logger.info('Retrieving department type', { departmentName });

  const existingDepartments = await apiClient.getDepartmentTypesByName({
    Name: departmentName,
  });

  if (existingDepartments.department_type.length > 0) {
    logger.info('Department type found', { departmentName });

    return existingDepartments.department_type[0]!.DepartmentTypeId;
  }

  if (!throwIfNotFound) {
    return null;
  }

  logger.info('Department type not found', { departmentName });
  throw new NotFound('Department type not found');
};

/**
 * Get or add a department type.
 * @param apiClient - The API client to interact with the backend.
 * @param departmentName - The name of the department.
 * @returns The ID of the department type.
 */
export const getOrAddDepartmentType = async (
  apiClient: Sdk,
  departmentName: string
): Promise<string> => {
  try {
    const departmentTypeId = await getDepartmentType(apiClient, departmentName);
    if (departmentTypeId) {
      return departmentTypeId;
    }
  } catch (error) {
    if (!(error instanceof NotFound)) {
      logger.error('Error retrieving department type', {
        departmentName,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  logger.info('Adding new department type', { departmentName });
  const newDepartment = await apiClient.insertDepartmentTypeWithOptionalGroupId(
    {
      Name: departmentName,
      Description: 'Department type added via Jira integration',
    }
  );

  if (!newDepartment.insert_department_type_one) {
    logger.error('Failed to add new department type', { departmentName });
    throw new BadRequest('Failed to add new department type');
  }

  return newDepartment.insert_department_type_one.DepartmentTypeId;
};
