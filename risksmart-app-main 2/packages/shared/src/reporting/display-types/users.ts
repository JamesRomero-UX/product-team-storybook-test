/**
 * Represents a field that represents a list of users. Note: custom datasources uses badgeList for users not "users".
 * This is primarily for conditional fields where we need the full list of users to filter against
 */
export interface UsersFieldDefinition {
  displayType: 'users';
  /**
   * Whether or not multiple users can be selected
   */
  multiple: boolean;
}
