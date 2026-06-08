import type { CustomisableRibbonModalFields } from './customisableRibbonModalSchema';
import {
  areItemFilterQueriesEqual,
  CustomisableRibbonFormSchema,
} from './customisableRibbonModalSchema';

describe('customisableRibbonModalSchema', () => {
  it('Must have at least one filter', () => {
    const filters: CustomisableRibbonModalFields = { Filters: [] };

    const result = CustomisableRibbonFormSchema.safeParse(filters);

    expect(result.success).toEqual(false);
    expect(result.error?.errors).toEqual([
      {
        code: 'custom',
        message: 'At least one filter is required',
        path: ['global'],
      },
    ]);
  });

  it('Token values cannot be null', () => {
    const filters: CustomisableRibbonModalFields = {
      Filters: [
        {
          id: '1',
          title: 'Title 1',
          itemFilterQuery: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                operator: '=',
                value: null,
                propertyKey: 'test',
              },
            ],
          },
        },
      ],
    };

    const result = CustomisableRibbonFormSchema.safeParse(filters);

    expect(result.success).toEqual(false);
    expect(result.error?.errors).toEqual([
      {
        code: 'custom',
        message: 'One or more filters have an invalid value',
        path: ['global'],
      },
    ]);
  });

  it('Token values on Token Groups cannot be null', () => {
    const filters: CustomisableRibbonModalFields = {
      Filters: [
        {
          id: '1',
          title: 'Title 1',
          itemFilterQuery: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                operation: 'and',
                tokens: [{ operator: '=', value: null, propertyKey: 'test' }],
              },
            ],
          },
        },
      ],
    };

    const result = CustomisableRibbonFormSchema.safeParse(filters);

    expect(result.success).toEqual(false);
    expect(result.error?.errors).toEqual([
      {
        code: 'custom',
        message: 'One or more filters have an invalid value',
        path: ['global'],
      },
    ]);
  });

  it('Two filters cannot have the same title', () => {
    const filters: CustomisableRibbonModalFields = {
      Filters: [
        {
          id: '1',
          title: 'Title 1',
          itemFilterQuery: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                operation: 'and',
                tokens: [{ operator: '=', value: 'a', propertyKey: 'test' }],
              },
            ],
          },
        },
        {
          id: '2',
          title: 'Title 1',
          itemFilterQuery: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                operation: 'and',
                tokens: [{ operator: '=', value: 'b', propertyKey: 'test' }],
              },
            ],
          },
        },
      ],
    };

    const result = CustomisableRibbonFormSchema.safeParse(filters);

    expect(result.success).toEqual(false);
    expect(result.error?.errors).toEqual([
      {
        code: 'custom',
        message: 'Two or more filters have the same title or filtering options',
        path: ['global'],
      },
    ]);
  });
});

describe('areItemFilterQueryEqual', () => {
  it('true if both queries are empty', () => {
    const equal = areItemFilterQueriesEqual(
      { operation: 'and', tokenGroups: [], tokens: [] },
      { operation: 'and', tokenGroups: [], tokens: [] }
    );
    expect(equal).toEqual(true);
  });

  it('false if queries have different operations', () => {
    const equal = areItemFilterQueriesEqual(
      { operation: 'and', tokenGroups: [], tokens: [] },
      { operation: 'or', tokenGroups: [], tokens: [] }
    );
    expect(equal).toEqual(false);
  });

  it('true if both queries have same token groups', () => {
    const equal = areItemFilterQueriesEqual(
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'a',
            value: '1',
            operator: '=',
          },
        ],
        tokens: [],
      },
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'a',
            value: '1',
            operator: '=',
          },
        ],
        tokens: [],
      }
    );
    expect(equal).toEqual(true);
  });

  it('false if queries have different numbers of token groups', () => {
    const equal = areItemFilterQueriesEqual(
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'a',
            value: '1',
            operator: '=',
          },
        ],
        tokens: [],
      },
      {
        operation: 'and',
        tokenGroups: [],
        tokens: [],
      }
    );
    expect(equal).toEqual(false);
  });

  it('true if queries have same token groups but in different order', () => {
    const equal = areItemFilterQueriesEqual(
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'a',
            value: '1',
            operator: '=',
          },
          {
            propertyKey: 'b',
            value: '1',
            operator: '=',
          },
        ],
        tokens: [],
      },
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'b',
            value: '1',
            operator: '=',
          },
          {
            propertyKey: 'a',
            value: '1',
            operator: '=',
          },
        ],
        tokens: [],
      }
    );
    expect(equal).toEqual(true);
  });

  it('false if tokenGroups have different values', () => {
    const equal = areItemFilterQueriesEqual(
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'a',
            value: '1',
            operator: '=',
          },
        ],
        tokens: [],
      },
      {
        operation: 'and',
        tokenGroups: [
          {
            propertyKey: 'a',
            value: '2',
            operator: '=',
          },
        ],
        tokens: [],
      }
    );
    expect(equal).toEqual(false);
  });
});
