import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import {
  AssessmentActivityStatusEnum,
  AssessmentActivityTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import {
  getAssessmentActivityWithLinkedItemsById,
  updateAssessmentActivity,
} from 'src/services/assessmentActivityService';
import {
  linkItems,
  unlinkItems,
} from 'src/services/linked-item/linkedItemService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './put';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/linked-item/linkedItemService');
vi.mock('src/services/node/nodeService');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/assessmentActivityService');

const getNodeMock = vi.mocked(getNode);
const hasPermissionMock = vi.mocked(hasPermission);
const linkItemsMock = vi.mocked(linkItems);
const unlinkItemsMock = vi.mocked(unlinkItems);
const updateAssessmentActivityMock = vi.mocked(updateAssessmentActivity);
const getAssessmentActivityWithLinkedItemsByIdMock = vi.mocked(
  getAssessmentActivityWithLinkedItemsById
);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);

describe('assessment activity put', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
  });

  it('should validate the put body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });

  it('returns forbidden when node does not exist', async () => {
    getNodeMock.mockResolvedValue(undefined);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Access to parent denied',
      extensions: [],
    });
  });

  it('returns forbidden when node not correct parent type', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Action,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Invalid parent type',
      extensions: [],
    });
  });

  it('returns forbidden when user does not have permissions', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(false);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Access denied',
      extensions: [],
    });
  });

  it('returns bad request when assessment activity is not found', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(true);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"error":"assessment activity is not linked to the provided assessment ID"}'
    );
  });

  it('returns bad request when assessment activity is linked to a different assessment', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(true);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '',
          ParentId: 'another-value',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"error":"assessment activity is not linked to the provided assessment ID"}'
    );
  });

  it('returns bad request when updating assessment activity fails', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(undefined);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"error":"failed to update assessment activity"}'
    );
  });

  it('returns bad request when updating assessment activity returns 0 rows modified', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(0);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"error":"failed to update assessment activity"}'
    );
  });

  it('returns 200 without inserting links when no links requested', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(1);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: null,
            LinkedItemIds: [],
            AssignedUser: null,
            CustomAttributeData: null,
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: ['auth0|644151efc3a961d2784456d9'],
            OwnerGroupIds: ['b3d6e665-2860-456c-a499-6764230d5bf1'],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"0a03401d-f1e8-4a03-9593-f1eb8a16f07b"}'
    );
    expect(linkItemsMock).not.toHaveBeenCalled();
    expect(unlinkItemsMock).not.toHaveBeenCalled();
    expect(updateAssessmentActivityMock).toHaveBeenCalledTimes(1);
    expect(updateAssessmentActivityMock).toHaveBeenCalledWith(hasuraMock, {
      ActivityType: 'task',
      Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
      OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
      CompletionDate: null,
      AssignedUser: null,
      Status: 'inprogress',
      Summary: 'A brand new activity',
      Title: 'New Activity',
      CustomAttributeData: null,
      Owners: [
        {
          UserId: 'auth0|644151efc3a961d2784456d9',
          ParentId: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
        },
      ],
      OwnerGroups: [
        {
          UserGroupId: 'b3d6e665-2860-456c-a499-6764230d5bf1',
          ParentId: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
        },
      ],
      OwnerUserIds: ['auth0|644151efc3a961d2784456d9'],
      OwnerGroupIds: ['b3d6e665-2860-456c-a499-6764230d5bf1'],
    });
  });

  it('should map all fields correctly', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(1);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: '2023-04-24T00:00:00',
            LinkedItemIds: [],
            AssignedUser: 'user-id-1',
            CustomAttributeData: '{}',
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: ['auth0|644151efc3a961d2784456d9'],
            OwnerGroupIds: ['b3d6e665-2860-456c-a499-6764230d5bf1'],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"0a03401d-f1e8-4a03-9593-f1eb8a16f07b"}'
    );
    expect(updateAssessmentActivityMock).toHaveBeenCalledTimes(1);
    expect(updateAssessmentActivityMock).toHaveBeenCalledWith(hasuraMock, {
      ActivityType: 'task',
      CompletionDate: '2023-04-24T00:00:00',
      AssignedUser: 'user-id-1',
      Status: 'inprogress',
      Summary: 'A brand new activity',
      Title: 'New Activity',
      Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
      OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
      CustomAttributeData: '{}',
      Owners: [
        {
          UserId: 'auth0|644151efc3a961d2784456d9',
          ParentId: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
        },
      ],
      OwnerGroups: [
        {
          UserGroupId: 'b3d6e665-2860-456c-a499-6764230d5bf1',
          ParentId: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
        },
      ],
      OwnerUserIds: ['auth0|644151efc3a961d2784456d9'],
      OwnerGroupIds: ['b3d6e665-2860-456c-a499-6764230d5bf1'],
    });
  });

  it('should insert links for all requested link IDs when no links exist already', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    linkItemsMock.mockResolvedValue({
      Links: [
        {
          Source: '',
          Target: '',
          RelationshipType: '',
        },
      ],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(1);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: '2023-04-24T00:00:00',
            LinkedItemIds: [
              '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
              'effa6651-3d39-48cc-9b92-4339e631d2b1',
              'b9d4b895-f528-41a4-bce2-aadd18e6e13e',
              'df7a5af3-e37d-4dce-abbf-a65af6494e9e',
            ],
            AssignedUser: 'user-id-1',
            CustomAttributeData: '{}',
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"0a03401d-f1e8-4a03-9593-f1eb8a16f07b"}'
    );
    expect(updateAssessmentActivityMock).toHaveBeenCalledTimes(1);
    expect(unlinkItemsMock).not.toHaveBeenCalled();
    expect(linkItemsMock).toHaveBeenCalledTimes(1);
    expect(linkItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
      Targets: [
        '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
        'effa6651-3d39-48cc-9b92-4339e631d2b1',
        'b9d4b895-f528-41a4-bce2-aadd18e6e13e',
        'df7a5af3-e37d-4dce-abbf-a65af6494e9e',
      ],
    });
  });

  it('should insert links for new requested link IDs when some links exist already', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    linkItemsMock.mockResolvedValue({
      Links: [
        {
          Source: '',
          Target: '',
          RelationshipType: '',
        },
      ],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(1);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [
        {
          Id: '',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
        },
        {
          Id: '',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: 'b9d4b895-f528-41a4-bce2-aadd18e6e13e',
        },
      ],
    });
    const linkIds = [
      '821e49fe-3d34-4970-bb19-6b38e7489882',
      '024dd0ea-bab7-45e0-af6f-f8569a2d1aeb',
      'd07a0ac4-3172-480c-a993-9c1a62e70a4a',
      '938be0ea-42ab-4313-9bb3-0f540146d0cb',
      'e7bc90e2-bdbe-415e-ace8-dee2d64ad575',
      'b5b3c79a-ad33-40a9-8357-c4dbcc644ebd',
      '66efb62a-a5ec-4db9-ae6f-d30740c86241',
      '82cf3599-ed4d-418b-904f-928e9cd1515d',
      'e90daf71-2224-4167-ba82-75466aebb335',
      'd71689bd-376c-4605-afa9-99ec866c4183',
      '5a865f33-d3db-4442-b019-c6225b2449e5',
      'd975df08-d27e-4551-9dec-9ae1044eac9a',
      'e0393e98-1e55-40db-b51f-156cd2baa870',
      '50cdb44f-4bae-4cef-befb-b32488ee68b9',
      '21b83d9e-a31e-40ec-be81-fbcdcfef2fbf',
      'df9630dd-92e7-4ddd-a189-31cd844e6678',
      '3d36365a-fb4d-4fb1-bc46-180b30dc2701',
      '54abbe0e-9651-4542-b84d-500c1b972799',
      '6ceb3c3b-ac57-4f78-a4d7-d09335294ae8',
      '7ce2a50b-838e-41f3-bb07-2c36454f0ef5',
      '75e29176-4021-4adb-83f1-9ba722a91527',
      '91c44d02-d14f-49d9-8af2-07d2bc3b4925',
      'eb1d97cd-1b21-41be-b279-e2d9ebad8eec',
      '64bb73f4-f49c-4076-8a24-724eb37657f3',
      'e56fd488-9912-42fb-9a1d-b472d35b9f34',
    ];

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: '2023-04-24T00:00:00',
            LinkedItemIds: [
              '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
              'b9d4b895-f528-41a4-bce2-aadd18e6e13e',
              ...linkIds,
            ],
            AssignedUser: 'user-id-1',
            CustomAttributeData: '{}',
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"0a03401d-f1e8-4a03-9593-f1eb8a16f07b"}'
    );
    expect(updateAssessmentActivityMock).toHaveBeenCalledTimes(1);
    expect(linkItemsMock).toHaveBeenCalledTimes(1);
    expect(unlinkItemsMock).not.toHaveBeenCalled();
    expect(linkItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
      Targets: linkIds,
    });
  });

  it('should insert and remove links for new requested link IDs when some links exist already', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    linkItemsMock.mockResolvedValue({
      Links: [
        {
          Source: '',
          Target: '',
          RelationshipType: '',
        },
      ],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(1);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [
        {
          Id: 'link-a',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
        },
        {
          Id: 'link-b',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
        },
        {
          Id: 'link-d',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: 'b9d4b895-f528-41a4-bce2-aadd18e6e13e',
        },
      ],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: '2023-04-24T00:00:00',
            LinkedItemIds: [
              '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
              'effa6651-3d39-48cc-9b92-4339e631d2b1',
              'df7a5af3-e37d-4dce-abbf-a65af6494e9e',
            ],
            AssignedUser: 'user-id-1',
            CustomAttributeData: '{}',
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"0a03401d-f1e8-4a03-9593-f1eb8a16f07b"}'
    );
    expect(updateAssessmentActivityMock).toHaveBeenCalledTimes(1);
    expect(linkItemsMock).toHaveBeenCalledTimes(1);
    expect(unlinkItemsMock).toHaveBeenCalledTimes(1);
    expect(unlinkItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Ids: ['link-a', 'link-d'],
    });
    expect(linkItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
      Targets: [
        'effa6651-3d39-48cc-9b92-4339e631d2b1',
        'df7a5af3-e37d-4dce-abbf-a65af6494e9e',
      ],
    });
  });

  it('should remove links when links exist on record but not on request input', async () => {
    getNodeMock.mockResolvedValue({
      ObjectType: ParentTypeEnum.Assessment,
      Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
      ancestorContributors: [],
    });
    linkItemsMock.mockResolvedValue({
      Links: [
        {
          Source: '',
          Target: '',
          RelationshipType: '',
        },
      ],
    });
    hasPermissionMock.mockResolvedValue(true);
    updateAssessmentActivityMock.mockResolvedValue(1);
    getAssessmentActivityWithLinkedItemsByIdMock.mockResolvedValue({
      assessment_activity: [
        {
          Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
          ActivityType: AssessmentActivityTypeEnum.Interview,
          CreatedByUser: '',
          CreatedAtTimestamp: '',
          ModifiedByUser: '',
          ModifiedAtTimestamp: '2024-05-28T10:30:32.139+00:00',
          IsRCSA: false,
          ownerGroups: [],
          owners: [],
        },
      ],
      linked_item: [
        {
          Id: 'link-a',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
        },
        {
          Id: 'link-b',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: '6c9a23ec-64af-4897-81cd-c6ebd383f6da',
        },
        {
          Id: 'link-d',
          Source: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
          Target: 'b9d4b895-f528-41a4-bce2-aadd18e6e13e',
        },
      ],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            ActivityType: AssessmentActivityTypeEnum.Task,
            ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Status: AssessmentActivityStatusEnum.Inprogress,
            Summary: 'A brand new activity',
            Title: 'New Activity',
            CompletionDate: '2023-04-24T00:00:00',
            LinkedItemIds: [],
            AssignedUser: 'user-id-1',
            CustomAttributeData: '{}',
            OriginalTimestamp: '2024-05-28T10:30:32.139+00:00',
            Id: '0a03401d-f1e8-4a03-9593-f1eb8a16f07b',
            OwnerUserIds: [],
            OwnerGroupIds: [],
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"0a03401d-f1e8-4a03-9593-f1eb8a16f07b"}'
    );
    expect(updateAssessmentActivityMock).toHaveBeenCalledTimes(1);
    expect(linkItemsMock).not.toHaveBeenCalled();
    expect(unlinkItemsMock).toHaveBeenCalledTimes(1);
    expect(unlinkItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Ids: ['link-a', 'link-b', 'link-d'],
    });
  });
});
