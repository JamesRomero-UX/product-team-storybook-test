import { getAuditItems } from './auditEntityFinder';

describe('audit entity finder', () => {
  describe('getAuditItems', () => {
    it('should return current entity, if only current entity exists', async () => {
      const { current, previous } = getAuditItems(
        [
          {
            CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
            CreatedByUser: 'auth0|644151efc3a961d2784456d9',
            Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
            ModifiedAtTimestamp: '2024-11-04T08:56:02.967506+00:00',
            ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
            ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
            ParentType: 'obligation',
            ResultType: 'obligation_assessment_result',
            __typename: 'assessment_result_parent_audit',
          },
        ],
        '2024-11-04T08:56:02.967506+00:00'
      );
      expect(current).toEqual({
        CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
        CreatedByUser: 'auth0|644151efc3a961d2784456d9',
        Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
        ModifiedAtTimestamp: '2024-11-04T08:56:02.967506+00:00',
        ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
        ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
        ParentType: 'obligation',
        ResultType: 'obligation_assessment_result',
        __typename: 'assessment_result_parent_audit',
      });
      expect(previous).toBeUndefined();
    });
    it('should return current and previous entity, if both exist', async () => {
      const { current, previous } = getAuditItems(
        [
          {
            CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
            CreatedByUser: 'auth0|644151efc3a961d2784456d9',
            Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
            ModifiedAtTimestamp: '2024-11-05T08:56:02.967506+00:00',
            ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
            ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
            ParentType: 'obligation',
            ResultType: 'obligation_assessment_result',
            __typename: 'assessment_result_parent_audit',
          },
          {
            CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
            CreatedByUser: 'auth0|644151efc3a961d2784456d9',
            Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
            ModifiedAtTimestamp: '2024-11-04T08:56:02.967506+00:00',
            ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
            ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
            ParentType: 'obligation',
            ResultType: 'obligation_assessment_result',
            __typename: 'assessment_result_parent_audit',
          },
          {
            CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
            CreatedByUser: 'auth0|644151efc3a961d2784456d9',
            Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
            ModifiedAtTimestamp: '2024-11-03T08:56:02.967506+00:00',
            ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
            ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
            ParentType: 'obligation',
            ResultType: 'obligation_assessment_result',
            __typename: 'assessment_result_parent_audit',
          },
          {
            CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
            CreatedByUser: 'auth0|644151efc3a961d2784456d9',
            Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
            ModifiedAtTimestamp: '2024-11-02T08:56:02.967506+00:00',
            ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
            ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
            ParentType: 'obligation',
            ResultType: 'obligation_assessment_result',
            __typename: 'assessment_result_parent_audit',
          },
        ],
        '2024-11-04T08:56:02.967506+00:00'
      );
      expect(current).toEqual({
        CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
        CreatedByUser: 'auth0|644151efc3a961d2784456d9',
        Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
        ModifiedAtTimestamp: '2024-11-04T08:56:02.967506+00:00',
        ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
        ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
        ParentType: 'obligation',
        ResultType: 'obligation_assessment_result',
        __typename: 'assessment_result_parent_audit',
      });
      expect(previous).toEqual({
        CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
        CreatedByUser: 'auth0|644151efc3a961d2784456d9',
        Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
        ModifiedAtTimestamp: '2024-11-03T08:56:02.967506+00:00',
        ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
        ParentId: '68873565-c665-4e4d-b086-763c59da1e68',
        ParentType: 'obligation',
        ResultType: 'obligation_assessment_result',
        __typename: 'assessment_result_parent_audit',
      });
    });

    it('should return undefined entity, if no entities exist', async () => {
      const { current, previous } = getAuditItems(
        [],
        '2024-11-04T08:56:02.967506+00:00'
      );
      expect(current).toBeUndefined();
      expect(previous).toBeUndefined();
    });
  });
});
