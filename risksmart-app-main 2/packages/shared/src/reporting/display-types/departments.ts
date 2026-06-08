/**
 * Represents a field that represents a list of departments. Note: custom datasources uses "badgeList" for departments not "departments".
 * This is primarily for conditional fields where we need the full list of departments to filter against
 */
export interface DepartmentsFieldDefinition {
  displayType: 'departments';
}
