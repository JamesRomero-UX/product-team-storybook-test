# Entity Hierarchy Implementation

## Problem

The `getLinkedItems` GraphQL query had a hardcoded entity hierarchy depth of 4 levels, which caused issues when entity hierarchies exceeded this depth, leading to truncated data display.

## Solution: Option 1 - Client-side Entity Path Building

We implemented a client-side approach that:

1. Fetches all entities with their `ParentId` fields
2. Uses the existing `buildEntityPathFromArray` utility to construct full entity paths
3. Supports unlimited hierarchy depth
4. Provides efficient caching of entity data

## Implementation Details

### Changes Made

1. **Modified GraphQL Query** (`getLinkedItems.graphql`):
   - Removed hardcoded 4-level nesting for entity hierarchy
   - Changed to simple flat structure with `Id`, `Name`, and `ParentId`

2. **Created `useEntityPath` Hook** (`hooks/useEntityPath.ts`):
   - Fetches all entities using `useGetEntitiesQuery`
   - Provides `getEntityPath` function that uses `buildEntityPathFromArray`
   - Implements efficient caching with `cache-first` fetch policy

3. **Updated LinkedItems Config** (`pages/linked-items/config.tsx`):
   - Replaced nested entity path building with array-based approach
   - Uses new `useEntityPath` hook for unlimited hierarchy depth

4. **Added Comprehensive Tests** (`hooks/useEntityPath.test.ts`):
   - Tests for nested entity paths
   - Tests for deep hierarchies (8+ levels)
   - Tests for edge cases (null, non-existent entities)
   - Tests for custom separators

### Key Benefits

✅ **Unlimited Hierarchy Depth**: No hardcoded limitations  
✅ **Better Performance**: Single query for all entities, cached efficiently  
✅ **Maintainable**: Uses existing utilities and follows established patterns  
✅ **Backward Compatible**: Existing code continues to work  
✅ **Testable**: Comprehensive test coverage  

### Code Example

```typescript
// Before (hardcoded 4 levels)
entity {
  Id
  Name
  ParentId
  parent {
    Id
    Name
    ParentId
    parent {
      Id
      Name
      ParentId
      parent {
        Id
        Name
        ParentId
      }
    }
  }
}

// After (unlimited depth)
entity {
  Id
  Name
  ParentId
}

// Usage
const { getEntityPath } = useEntityPath();
const entityPath = getEntityPath(entityId); // "Corporate > IT Department > Security Team"
```

### Performance Considerations

- **Caching**: Uses `cache-first` policy to avoid unnecessary entity re-fetches
- **Memoization**: Entity processing is memoized in the hook
- **Efficient Lookup**: `buildEntityPathFromArray` uses Map for O(1) entity lookups
- **Depth Protection**: Built-in protection against infinite loops (max 50 levels)

### Migration Path

The implementation is backward compatible:

1. Existing hardcoded entity paths continue to work
2. New components automatically get unlimited depth support
3. The old `getEntityPath` function is marked as deprecated
4. Migration to the new approach can be done incrementally

### Error Handling

- Returns empty string for null/undefined entity IDs
- Handles missing entities gracefully
- Prevents infinite loops with depth limits
- Provides loading states for UI feedback

This solution provides a robust, scalable approach to entity hierarchy display that eliminates the hardcoded depth limitation while maintaining good performance and developer experience.
