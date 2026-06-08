# Testing Setup Guide for RiskSmart Components

This guide outlines the comprehensive testing approach and common patterns used when creating tests for RiskSmart components, particularly for form components with entity labels functionality.

## Context Primer

This context should be used for future AI interactions when working on similar testing tasks. The RiskSmart application has complex form components that integrate with GraphQL queries and feature toggles for entity labels.

### Key Testing Requirements

1. **Type Safety**: All tests must be TypeScript-compliant with proper type definitions
2. **Lint Compliance**: Code must pass ESLint rules with no warnings/errors
3. **Mock Patterns**: Consistent mocking of dependencies and GraphQL responses
4. **Edge Case Coverage**: Comprehensive testing of undefined/null value handling
5. **Integration Testing**: Testing component interactions and feature toggles

## Common Testing Patterns

### 1. Component Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { useForm } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Component imports
import { ComponentUnderTest } from './ComponentUnderTest';
import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';

// Mock dependencies
vi.mock('@/hooks/useEntityLabelsFeature');
```

### 2. Required Props for Form Components

Form components typically require these props:

- `control`: From react-hook-form
- `name`: Field name
- `label`: Required label text (often missed in initial tests)
- `data-testid`: For test identification

### 3. Entity Labels Hook Mocking

The `useEntityLabelsFeature` hook returns multiple properties:

```typescript
const mockUseEntityLabelsFeature = vi.mocked(useEntityLabelsFeature);

mockUseEntityLabelsFeature.mockReturnValue({
  shouldShowEntityLabels: false,
  hasEntityFilter: false,
  isMultiEntityContext: false,
  entityFilterCount: 0,
});
```

### 4. GraphQL Type Definitions

When creating mock data, ensure all required fields are included:

```typescript
// Enterprise risk instance requires EntityId
enterpriseRiskInstance: {
  EntityId: 'entity-1',
  entity: createMockEntity(),
}

// Handle undefined/null ParentId correctly
ParentId: undefined as unknown as string | null,
```

### 5. TypeScript Type Casting

For test data that needs to violate types (like testing undefined values):

```typescript
// Correct approach
{ value: undefined as unknown as string, label: 'Invalid' }

// Avoid - causes lint errors
{ value: undefined as any, label: 'Invalid' }
```

### 6. Mock Component Structure

For complex components with specific prop requirements:

```typescript
vi.mock('@/components/tokens', () => ({
  default: ({ tokens, onRemove, disabled }: {
    tokens: Array<{ value: string; label: string; subtitle?: string }>;
    onRemove: (value: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="tokens-container">
      {tokens.map((token) => (
        <div key={token.value} data-testid={`token-${token.value}`}>
          {/* Mock implementation */}
        </div>
      ))}
    </div>
  ),
}));
```

## File Structure Standards

### Test File Locations

- Component tests: Same directory as component with `.test.tsx` suffix
- Utility tests: Same directory as utility with `.test.ts` suffix
- Integration tests: Component directory with descriptive name

### Required Test Files for Form Components

1. **Component.test.tsx** - Main component testing
2. **utilsWithEntities.test.ts** - Utility functions with entity support
3. **Component.integration.test.tsx** - Feature integration testing

## Common Issues and Solutions

### 1. Missing Required Props

**Issue**: `Property 'label' is missing`
**Solution**: Add label prop to all form components

### 2. Incomplete Hook Mocks

**Issue**: Missing properties in useEntityLabelsFeature mock
**Solution**: Include all required hook properties

### 3. Type Errors with undefined Values

**Issue**: `Type 'undefined' is not assignable to type 'string'`
**Solution**: Use `undefined as unknown as string` for test data

### 4. Missing EntityId in GraphQL Mocks

**Issue**: GraphQL type errors for enterprise risk instance
**Solution**: Always include EntityId field in mock data

### 5. Lint Errors with 'any' Types

**Issue**: `Unexpected any. Specify a different type`
**Solution**: Use proper TypeScript interfaces for mock props

## Test Coverage Requirements

### Critical Test Scenarios

1. **Null/Undefined Handling**
   - Filter undefined values from arrays
   - Handle null ParentId in entity hierarchies
   - Graceful fallbacks for missing labels

2. **Entity Labels Integration**
   - Component behavior with feature enabled/disabled
   - Correct GraphQL query selection
   - Entity path rendering in UI components

3. **Form Integration**
   - react-hook-form control integration
   - Validation and error handling
   - Disabled state behavior

4. **User Interactions**
   - Token removal functionality
   - Form submission workflows
   - Loading and error states

### Edge Cases

- Empty data arrays
- Deeply nested entity hierarchies
- Special characters in entity names
- Component remounting scenarios
- GraphQL error conditions

## Performance Considerations

- Mock heavy dependencies (GraphQL, complex utilities)
- Use data-testids for reliable element selection
- Batch GraphQL mocks for integration tests
- Test component lifecycle and cleanup

## Before Submitting Tests

### Checklist

1. ✅ Run `pnpm run tsc` - No TypeScript errors
2. ✅ Run `pnpm run lint:fix` - Fix auto-fixable issues
3. ✅ Run `pnpm run lint` - No remaining lint errors
4. ✅ All test scenarios covered per requirements
5. ✅ Proper TypeScript types throughout
6. ✅ Consistent mock patterns used
7. ✅ Integration tests for feature interactions

### Common Commands

```bash
# Check TypeScript
cd packages/web && pnpm run tsc

# Fix lint issues
cd packages/web && pnpm run lint:fix

# Check remaining lint issues
cd packages/web && pnpm run lint

# Run tests
cd packages/web && pnpm run test:unit
```

This guide should be referenced for all future testing work on RiskSmart components to ensure consistency and completeness.
