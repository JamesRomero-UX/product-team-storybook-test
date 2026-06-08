/**
 * Represents a field that represents a list of tags. Note: custom datasources uses badgeList for tags not "tags".
 * This is primarily for conditional fields where we need the full list of tags to filter against
 */
export interface TagsFieldDefinition {
  displayType: 'tags';
}
