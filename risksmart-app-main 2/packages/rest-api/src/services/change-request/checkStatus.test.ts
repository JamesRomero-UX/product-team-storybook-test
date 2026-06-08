import { describe, expect, it } from 'vitest';

import {
  ApprovalRuleTypeEnum,
  ApprovalStatusEnum,
} from '../../../generated/graphql'; // Adjust this import according to your file structure
import type { ChangeRequest } from './checkStatus';
import { checkStatus } from './checkStatus';

// Mocking the necessary types
// Helper function to generate mock data
const createChangeRequestMock = (
  responses: ChangeRequest['responses']
): ChangeRequest => ({
  Id: '',
  ParentId: '',
  responses,
  RequestedChanges: {},
  CreatedByUser: '',
  ActionUserId: '',
  ChangeRequestStatus: ApprovalStatusEnum.Pending,
  OrgKey: 'testorg1',
  CreatedAtTimestamp: new Date().toISOString(),
  Comment: '',
});

describe('checkStatus', () => {
  describe('All Approve Rule', () => {
    it('should approve when all responses are approved', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: '2',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Approved);
      expect(result.activeLevelId).toBeNull();
    });

    it('should reject if any response is not approved', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: false,
          approver: {
            Id: '2',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected);
      expect(result.activeLevelId).toBeNull();
    });

    it('should reject if any response is not approved and there are more responses than approvals', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: false,
          approver: {
            Id: '2',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: null, // Unresponded, implying a pending state that leads to rejection due to lack of unanimous approval
          approver: {
            Id: '3',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected);
    });
  });

  describe('Any One Approve Rule', () => {
    it('should approve if at least one approver approves', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
        {
          Approved: null,
          approver: {
            Id: '2',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Approved);
      expect(result.activeLevelId).toBeNull();
    });

    it('should remain pending if there are no approvals yet', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: null,
          approver: {
            Id: '1',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Pending);
      expect(result.activeLevelId).toBe('2');
    });

    it('should reject if there are no approvals and at least one rejection', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: false,
          approver: {
            Id: '1',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
        {
          Approved: null,
          approver: {
            Id: '2',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected);
    });
  });

  describe('Majority Approve Rule', () => {
    it('should approve if more than half the responses are approved', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: '2',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: false,
          approver: {
            Id: '3',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Approved);
      expect(result.activeLevelId).toBeNull();
    });

    it('should reject if the majority is not achieved and enough rejections exist', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: false,
          approver: {
            Id: '1',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: false,
          approver: {
            Id: '2',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: null,
          approver: {
            Id: '3',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: null,
          approver: {
            Id: '4',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected);
      expect(result.activeLevelId).toBeNull();
    });

    it('should reject if the majority of responses are rejections or non-approvals', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: false,
          approver: {
            Id: '1',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: false,
          approver: {
            Id: '2',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: null, // Assuming a neutral or non-response still contributes towards not achieving a majority approval
          approver: {
            Id: '3',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected);
    });
  });

  describe('Edge Cases', () => {
    it('should handle an empty change request gracefully', () => {
      const mockChangeRequest = createChangeRequestMock([]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Approved);
      expect(result.activeLevelId).toBeNull();
    });

    it('should default to pending if all responses are null', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: null,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: null,
          approver: {
            Id: '2',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Pending);
      expect(result.activeLevelId).toBe('1');
    });

    it('should properly handle mixed approval rule types across different levels', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: '2',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
        {
          Approved: false,
          approver: {
            Id: '3',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected); // Since one level has a rejection
      expect(result.activeLevelId).toBeNull();
    });

    it('should mark as approved if there are no approvers but rules are met', () => {
      const mockChangeRequest = createChangeRequestMock([
        // Simulating a scenario with no actual approvers but a response that implies approval
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Approved);
      expect(result.activeLevelId).toBeNull();
    });

    it('should correctly handle a level with no responses', () => {
      // This test implies that there might be levels defined but no responses tied to them
      const mockChangeRequest = createChangeRequestMock([
        // Simulating a scenario where a level exists but has no responses
        // This case might be more about data structure integrity than functional handling
      ]);
      mockChangeRequest.responses.push({
        Approved: null,
        approver: {
          Id: '1',
          level: { Id: '2', ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove },
        },
      }); // Adding an empty level
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Pending);
      expect(result.activeLevelId).toBe('2'); // Assuming the logic that a level with no responses is considered pending
    });
  });

  describe('Returning the active level ID', () => {
    it('should set the active level ID to the next pending level among multiple levels', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: '2',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: null, // Pending approval in level 2
          approver: {
            Id: '3',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: null, // Pending approval in level 2
          approver: {
            Id: '4',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Pending);
      expect(result.activeLevelId).toBe('2');
    });

    it('should set the active level ID to null if all levels are approved', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: '2',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: '3',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Approved);
      expect(result.activeLevelId).toBeNull();
    });

    it('should correctly identify the active level when previous levels are rejected', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: false, // Rejection at level 1
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: null, // Pending approval in level 2, but irrelevant due to rejection at level 1
          approver: {
            Id: '2',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.AnyOneApprove,
            },
          },
        },
        {
          Approved: null, // Pending approval in level 3, but irrelevant due to rejection at level 1
          approver: {
            Id: '3',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Rejected);
      expect(result.activeLevelId).toBeNull(); // Indicates no further action needed as the request is already rejected
    });

    it('Should correctly identify the active level when the level is between two others', () => {
      const mockChangeRequest = createChangeRequestMock([
        {
          Approved: true,
          approver: {
            Id: '1',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: true, // Approved at level 1
          approver: {
            Id: '2',
            level: {
              Id: '1',
              ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
            },
          },
        },
        {
          Approved: null, // Pending at level 2
          approver: {
            Id: '3',
            level: {
              Id: '2',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
        {
          Approved: null, // Pending at level 3
          approver: {
            Id: '4',
            level: {
              Id: '3',
              ApprovalRuleType: ApprovalRuleTypeEnum.MajorityApprove,
            },
          },
        },
      ]);
      const result = checkStatus(mockChangeRequest);
      expect(result.status).toBe(ApprovalStatusEnum.Pending);
      expect(result.activeLevelId).toBe('2'); // Next level that requires action
    });
  });
});
