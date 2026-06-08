import { Approval_Rule_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import {
  getCurrentApprovers,
  getCurrentLevel,
  getMaxLevel,
  getNextApprovers,
} from '@/utils/changeRequestUtils';

const generateApprovalResponse = (
  sequenceOrder: number,
  approved: boolean | null,
  ownerApprover: boolean | null,
  approverFriendlyName: null | string,
  levelId: string = 'e5d7061d-ee80-433c-8a73-2ee0d6b03764'
) => {
  return {
    Id: 'response-1',
    Approved: approved,
    CreatedAtTimestamp: '2024-11-08T09:19:58.066661+00:00',
    ModifiedAtTimestamp: '2024-11-08T09:19:58.066661+00:00',
    approver: {
      Id: 'approver-1',
      OwnerApprover: ownerApprover,
      level: {
        Id: levelId,
        ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
        SequenceOrder: sequenceOrder,
        approval: null,
      },
      user: approverFriendlyName
        ? {
            FriendlyName: approverFriendlyName,
            Email: 'user1@user.com',
            Id: 'auth0|644151efc3a961d2784456d9',
          }
        : null,
      group: null,
    },
  };
};

describe('changeRequestUtils', () => {
  describe('getMaxLevel', () => {
    it('should handle no responses', () => {
      const result = getMaxLevel([]);
      expect(result).toEqual(0);
    });
    it('should return total count of unique levels, given 3 responses with different level IDs', () => {
      const result = getMaxLevel([
        generateApprovalResponse(0, null, true, null, 'level-1'),
        generateApprovalResponse(1, null, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual(3); // 3 unique level IDs
    });
    it('should return total count of unique levels, given multiple responses with mixed level IDs', () => {
      const result = getMaxLevel([
        generateApprovalResponse(0, null, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User F', 'level-2'),
        generateApprovalResponse(3, null, null, 'User E', 'level-3'),
        generateApprovalResponse(1, null, null, 'User A', 'level-1'),
        generateApprovalResponse(1, null, null, 'User B', 'level-1'),
        generateApprovalResponse(1, null, true, null, 'level-1'),
        generateApprovalResponse(1, null, null, 'User C', 'level-1'),
        generateApprovalResponse(2, null, null, 'User D', 'level-2'),
      ]);
      expect(result).toEqual(3); // 3 unique level IDs: level-1, level-2, level-3
    });
  });
  describe('getCurrentLevel', () => {
    it('should handle no responses', () => {
      const result = getCurrentLevel([]);
      expect(result).toEqual(0);
    });
    it('should return 1 (no fully approved levels), given 3 responses with none approved', () => {
      const result = getCurrentLevel([
        generateApprovalResponse(0, null, true, null, 'level-1'),
        generateApprovalResponse(1, null, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual(1); // 0 fully approved levels + 1 = 1
    });
    it('should return 3 (two fully approved levels), given 3 responses with two levels approved', () => {
      const result = getCurrentLevel([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(1, true, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual(3); // 2 fully approved levels + 1 = 3
    });

    it('should return 2 (one fully approved level), given multiple responses where only level-1 is fully approved', () => {
      const result = getCurrentLevel([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User F', 'level-2'),
        generateApprovalResponse(3, null, null, 'User E', 'level-3'),
        generateApprovalResponse(1, true, null, 'User A', 'level-1'),
        generateApprovalResponse(1, true, null, 'User B', 'level-1'),
        generateApprovalResponse(1, true, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User D', 'level-2'),
      ]);
      expect(result).toEqual(2); // 1 fully approved level (level-1) + 1 = 2
    });

    it('should return 4 (three fully approved levels), given 3 responses all approved', () => {
      const result = getCurrentLevel([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(1, true, null, 'User A', 'level-2'),
        generateApprovalResponse(2, true, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual(4); // 3 fully approved levels + 1 = 4
    });
  });
  describe('getCurrentApprovers', () => {
    it('should handle no responses', () => {
      const result = getCurrentApprovers([]);
      expect(result).toEqual([]);
    });

    it('should select the current change request approvers - as owner approver, given 3 responses all of increasing sequence with none approved', () => {
      const result = getCurrentApprovers([
        generateApprovalResponse(0, null, true, null, 'level-1'),
        generateApprovalResponse(1, null, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual([{ id: 'owner', label: 'Owner' }]);
    });

    it('should select the current change request approvers - User B, given 3 responses all of increasing sequence with two approved', () => {
      const result = getCurrentApprovers([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(1, true, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual([
        {
          id: 'auth0|644151efc3a961d2784456d9',
          label: 'User B',
        },
      ]);
    });

    it('should select all current change request approvers with same level ID, given multiple responses of mixed increasing sequence', () => {
      const result = getCurrentApprovers([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User F', 'level-2'),
        generateApprovalResponse(3, null, null, 'User E', 'level-3'),
        generateApprovalResponse(1, true, null, 'User A', 'level-1'),
        generateApprovalResponse(1, true, null, 'User B', 'level-1'),
        generateApprovalResponse(1, true, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User D', 'level-2'),
      ]);
      expect(result).toEqual([
        {
          id: 'auth0|644151efc3a961d2784456d9',
          label: 'User F',
        },
        {
          id: 'auth0|644151efc3a961d2784456d9',
          label: 'User D',
        },
      ]);
    });

    it('should return empty array when all responses are approved', () => {
      const result = getCurrentApprovers([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(1, true, null, 'User A', 'level-2'),
        generateApprovalResponse(2, true, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual([]);
    });
  });

  describe('getNextApprovers', () => {
    it('should handle no responses', () => {
      const result = getNextApprovers([]);
      expect(result).toEqual([]);
    });

    it('should select the next change request approvers, given 3 responses all of increasing sequence with none approved', () => {
      const result = getNextApprovers([
        generateApprovalResponse(0, null, true, null, 'level-1'),
        generateApprovalResponse(1, null, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual([
        {
          id: 'auth0|644151efc3a961d2784456d9',
          label: 'User A',
        },
      ]);
    });

    it('should select no next change request approvers, given 3 responses all of increasing sequence with two approved and none after', () => {
      const result = getNextApprovers([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(1, true, null, 'User A', 'level-2'),
        generateApprovalResponse(2, null, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual([]);
    });

    it('should select all next change request approvers with same level ID, given multiple responses of mixed increasing sequence', () => {
      const result = getNextApprovers([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User F', 'level-2'),
        generateApprovalResponse(3, null, null, 'User E', 'level-3'),
        generateApprovalResponse(1, true, null, 'User A', 'level-1'),
        generateApprovalResponse(1, true, null, 'User B', 'level-1'),
        generateApprovalResponse(1, true, true, null, 'level-1'),
        generateApprovalResponse(2, null, null, 'User D', 'level-2'),
        generateApprovalResponse(3, null, null, 'User G', 'level-3'),
      ]);
      expect(result).toEqual([
        {
          id: 'auth0|644151efc3a961d2784456d9',
          label: 'User E',
        },
        {
          id: 'auth0|644151efc3a961d2784456d9',
          label: 'User G',
        },
      ]);
    });

    it('should select 0 next change request approvers, given 3 responses all of increasing sequence with all approved', () => {
      const result = getNextApprovers([
        generateApprovalResponse(0, true, true, null, 'level-1'),
        generateApprovalResponse(1, true, null, 'User A', 'level-2'),
        generateApprovalResponse(2, true, null, 'User B', 'level-3'),
      ]);
      expect(result).toEqual([]);
    });
  });
});
