import { ActionStatusEnum } from 'generated/graphql';
import { ActionService } from 'src/services/action/action.service';
import { vi } from 'vitest';

import { workflows } from './workflows';

vi.mock('src/services/action/action.service');

const actionServiceMock = vi.mocked(ActionService);

const workflow = workflows['update-action-details']('tenant');

const mockAction = {
  Id: '1',
  Description: 'description',
  Title: 'title',
  Status: ActionStatusEnum.Open,
  CustomAttributeData: {
    key: 'value',
  },
  ModifiedAtTimestamp: '2000-01-01',
  Priority: 1,
  DateDue: '2022-01-01',
  DateRaised: '2022-02-01',
  ownerGroups: [{ UserGroupId: '1' }],
  contributorGroups: [{ UserGroupId: '2' }],
  owners: [{ UserId: '1' }],
  contributors: [{ UserId: '2' }],
  tags: [{ TagTypeId: '1' }],
  departments: [{ DepartmentTypeId: '1' }],
  parents: [],
};

const mockChanges = {
  ...mockAction,
  Description: 'description',
  OriginalTimestamp: '2022-03-01',
  OwnerGroupIds: ['1'],
  ContributorGroupIds: ['2'],
  OwnerIds: ['1'],
  ContributorIds: ['2'],
  TagTypeIds: ['1'],
  DepartmentTypeIds: ['1'],
  Contributors: [{ UserId: '2' }],
  Owners: [{ UserId: '1' }],
  OwnerGroups: [{ UserGroupId: '1' }],
  ContributorGroups: [{ UserGroupId: '2' }],
};

describe('update-action-details.workflow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('approvalCheck', () => {
    it('should return false when details are unchanged', async () => {
      actionServiceMock.mockReturnValue({
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findById: vi.fn().mockResolvedValue(mockAction),
        updateByPk: vi.fn(),
        updateWithFiles: vi.fn(),
      });

      const result = await workflow.config.approvalCheck?.('tenant')?.(
        {
          id: 'id',
          orgKey: 'orgKey',
          userId: 'userId',
          data: mockChanges,
        },
        false
      );

      expect(result).toBe(false);
    });

    it.each([
      {
        mockChanges: { ...mockChanges, Description: 'new description' },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, OwnerIds: ['2'] },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, Title: 'new title' },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, ContributorIds: ['3'] },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, DateRaised: '1905-02-01' },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, DateDue: '1905-01-01' },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, Priority: 2 },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, TagTypeIds: ['2'] },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, DepartmentTypeIds: ['2'] },
        expectedResult: true,
      },
      {
        mockChanges: { ...mockChanges, Status: ActionStatusEnum.Closed },
        expectedResult: false,
      },
    ])(
      'should return $expectedResult when details are changed',
      async ({ mockChanges, expectedResult }) => {
        actionServiceMock.mockReturnValue({
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          findById: vi.fn().mockResolvedValue(mockAction),
          updateByPk: vi.fn(),
          updateWithFiles: vi.fn(),
        });

        const result = await workflow.config.approvalCheck?.('tenant')?.(
          {
            id: 'id',
            orgKey: 'orgKey',
            userId: 'userId',
            data: mockChanges,
          },
          false
        );

        expect(result).toBe(expectedResult);
      }
    );

    it('should return true when files are changed', async () => {
      actionServiceMock.mockReturnValue({
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findById: vi.fn().mockResolvedValue(mockAction),
        updateByPk: vi.fn(),
        updateWithFiles: vi.fn(),
      });

      const result = await workflow.config.approvalCheck?.('tenant')?.(
        {
          id: 'id',
          orgKey: 'orgKey',
          userId: 'userId',
          data: mockChanges,
        },
        true
      );

      expect(result).toBe(true);
    });
  });
});
