import { Action_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { ActionFormFieldData } from './actionsSchema';
import { ActionFormSchema } from './actionsSchema';

describe('Action Schema', () => {
  const validAction: ActionFormFieldData = {
    DateDue: '2023-09-12T12:16:44+00:00',
    Title: 'Title',
    Status: Action_Status_Enum.Open,
    Priority: 1,
    Description: 'Description',
    tags: [],
    departments: [],
    DateRaised: '2023-09-12T12:16:44+00:00',
    Owners: [{ value: 'owner123', type: 'user' }],
    Contributors: [],
    ClosedDate: null,
    files: [],
    ancestorContributors: [],
  };

  it('should validate a valid object', () => {
    const data = validAction;
    const result = ActionFormSchema.safeParse(data, {});
    expect(result).toEqual({ data, success: true });
  });

  describe('ClosedDate', () => {
    it('should be required if status = closed', () => {
      const data: ActionFormFieldData = {
        ...validAction,
        ClosedDate: null,
        Status: Action_Status_Enum.Closed,
      };
      const result = ActionFormSchema.safeParse(data, {});
      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toEqual('Required');
      }
    });

    it('should not be required if status = open', () => {
      const data: ActionFormFieldData = {
        ...validAction,
        ClosedDate: null,
        Status: Action_Status_Enum.Open,
      };
      const result = ActionFormSchema.safeParse(data, {});
      expect(result).toEqual({ data, success: true });
    });
  });
});
