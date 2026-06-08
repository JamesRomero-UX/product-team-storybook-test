import type { PropertyFilterOperatorExtended } from '@cloudscape-design/collection-hooks';

import { createIdLabelFieldPropertyFilter } from '@/utils/table/utils/filterUtils';

describe('filterUtils', () => {
  describe('createIdLabelFieldPropertyFilter', () => {
    //TODO: find out how to test the match functions, far too much noise from cloudscape
    it('To have 5 operators', () => {
      const items: { id: string; label: string }[] = [];
      const result = createIdLabelFieldPropertyFilter(items);
      expect(result.operators).toHaveLength(5);
    });
    it('To have an equals operator', () => {
      const items: { id: string; label: string }[] = [];
      const result = createIdLabelFieldPropertyFilter(items);
      const equalsOperator = result.operators?.filter(
        (c) => (c as PropertyFilterOperatorExtended<unknown>).operator === '='
      );
      expect(equalsOperator).toHaveLength(1);
    });
    it('To have a contains operator', () => {
      const items: { id: string; label: string }[] = [];
      const result = createIdLabelFieldPropertyFilter(items);
      const containsOperator = result.operators?.filter(
        (c) => (c as PropertyFilterOperatorExtended<unknown>).operator === ':'
      );
      expect(containsOperator).toHaveLength(1);
    });
    it('To have a does not contains operator', () => {
      const items: { id: string; label: string }[] = [];
      const result = createIdLabelFieldPropertyFilter(items);
      const doesNotContainsOperator = result.operators?.filter(
        (c) => (c as PropertyFilterOperatorExtended<unknown>).operator === '!:'
      );
      expect(doesNotContainsOperator).toHaveLength(1);
    });
    it('To have a does not equals operator', () => {
      const items: { id: string; label: string }[] = [];
      const result = createIdLabelFieldPropertyFilter(items);
      const doesNotEqualsOperator = result.operators?.filter(
        (c) => (c as PropertyFilterOperatorExtended<unknown>).operator === '!='
      );
      expect(doesNotEqualsOperator).toHaveLength(1);
    });
    it('To have a less than operator', () => {
      const items: { id: string; label: string }[] = [];
      const result = createIdLabelFieldPropertyFilter(items);
      const lessThanOperator = result.operators?.filter(
        (c) => (c as PropertyFilterOperatorExtended<unknown>).operator === '<'
      );
      expect(lessThanOperator).toHaveLength(1);
    });
  });
});
