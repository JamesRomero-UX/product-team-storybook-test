import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import {
  deleteLinkedItems,
  getLinkedItems,
} from 'src/services/linked-item/linkedItemService';
import { getNode } from 'src/services/node/nodeService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { deleteParentChildLink } from './linkInserter';
import { handler } from './unlink';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/linked-item/linkedItemService');
vi.mock('src/services/node/nodeService');
vi.mock('./linkInserter');

const getNodeMock = vi.mocked(getNode);
const getLinkedItemsMock = vi.mocked(getLinkedItems);
const deleteLinkedItemsMock = vi.mocked(deleteLinkedItems);
const deleteParentChildLinkMock = vi.mocked(deleteParentChildLink);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);

describe('unlink items post', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
  });

  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });

  const LINK_ID1 = '1171ee10-a8dc-417a-a250-368a1aeb1fe4';
  const LINK_ID2 = 'a92cdf75-8ef7-4e9a-a96c-b644526ef3fd';
  const LINK_ID3 = '4a4d95c8-b881-4cc8-8a7f-0fcfb5d2228e';
  const LINK_ID4 = '33b17e62-195c-4dc6-8983-cd9306e7d4d8';
  const LINK_ID5 = '1724815f-9b68-43d9-82f8-fe563e36c2ee';
  const RISK_ID = 'cb6f4862-6b43-4368-89cd-3b274e452cb1';
  const DOCUMENT_ID = '19b346b5-58d4-4fa3-a7cf-f980ce4e23c2';
  const OBLIGATION_ID = '5aab9815-18bb-41b8-8fd5-b9ba25c7cc51';
  const ISSUE_ID_1 = '138e07e3-6bb4-4b0b-b913-c590252a1a4b';
  const ISSUE_ID_2 = '0b07dbab-b583-4cdc-91e6-060b155ea823';
  const ACTION_ID_1 = '1ee36ce0-2cc3-40f6-8751-6b4ef720e419';
  const ACTION_ID_2 = 'f878676d-90f1-4bf5-9422-4bd3f5db6ebe';
  const CONTROL_ID_1 = '7e05246b-f632-4280-bc75-4828b05a0d59';
  const CONTROL_ID_2 = '4b7cd02f-1cfa-49a1-8676-057e0fb1a4d0';

  it('oi', async () => {
    getLinkedItemsMock.mockImplementation(async () => {
      return [
        {
          Id: LINK_ID1,
          Source: RISK_ID,
          Target: OBLIGATION_ID,
          RelationshipType: 'sibling',
        },
        {
          Id: LINK_ID2,
          Source: RISK_ID,
          Target: DOCUMENT_ID,
          RelationshipType: 'sibling',
        },
        {
          Id: LINK_ID3,
          Source: RISK_ID,
          Target: ACTION_ID_1,
          RelationshipType: 'parent_child',
        },
        {
          Id: LINK_ID4,
          Source: RISK_ID,
          Target: ISSUE_ID_1,
          RelationshipType: 'parent_child',
        },
        {
          Id: LINK_ID5,
          Source: RISK_ID,
          Target: CONTROL_ID_1,
          RelationshipType: 'parent_child',
        },
      ];
    });
    getNodeMock.mockImplementation(async (hasuraMock, id) => {
      switch (id) {
        case RISK_ID:
          return {
            Id: RISK_ID,
            ObjectType: ParentTypeEnum.Risk,
            ancestorContributors: [],
          };
        case DOCUMENT_ID:
          return {
            Id: DOCUMENT_ID,
            ObjectType: ParentTypeEnum.Document,
            ancestorContributors: [],
          };
        case OBLIGATION_ID:
          return {
            Id: OBLIGATION_ID,
            ObjectType: ParentTypeEnum.Obligation,
            ancestorContributors: [],
          };
        case ISSUE_ID_1:
          return {
            Id: ISSUE_ID_1,
            ObjectType: ParentTypeEnum.Issue,
            ancestorContributors: [],
          };
        case ISSUE_ID_2:
          return {
            Id: ISSUE_ID_2,
            ObjectType: ParentTypeEnum.Issue,
            ancestorContributors: [],
          };
        case ACTION_ID_1:
          return {
            Id: ACTION_ID_1,
            ObjectType: ParentTypeEnum.Action,
            ancestorContributors: [],
          };
        case ACTION_ID_2:
          return {
            Id: ACTION_ID_2,
            ObjectType: ParentTypeEnum.Action,
            ancestorContributors: [],
          };
        case CONTROL_ID_1:
          return {
            Id: CONTROL_ID_1,
            ObjectType: ParentTypeEnum.Control,
            ancestorContributors: [],
          };
        case CONTROL_ID_2:
          return {
            Id: CONTROL_ID_2,
            ObjectType: ParentTypeEnum.Control,
            ancestorContributors: [],
          };
      }
    });
    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'insertLinkedItem',
          input: { Ids: [LINK_ID1, LINK_ID2, LINK_ID3, LINK_ID4, LINK_ID5] },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );

    expect(deleteLinkedItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Ids: [LINK_ID1, LINK_ID2],
    });

    expect(deleteParentChildLinkMock).toHaveBeenCalledTimes(3);
    expect(deleteParentChildLinkMock).toHaveBeenNthCalledWith(
      1,
      hasuraMock,
      {
        Id: RISK_ID,
        ObjectType: ParentTypeEnum.Risk,
        ancestorContributors: [],
      },
      {
        Id: ACTION_ID_1,
        ObjectType: ParentTypeEnum.Action,
        ancestorContributors: [],
      }
    );
    expect(deleteParentChildLinkMock).toHaveBeenNthCalledWith(
      2,
      hasuraMock,
      {
        Id: RISK_ID,
        ObjectType: ParentTypeEnum.Risk,
        ancestorContributors: [],
      },
      {
        Id: ISSUE_ID_1,
        ObjectType: ParentTypeEnum.Issue,
        ancestorContributors: [],
      }
    );
    expect(deleteParentChildLinkMock).toHaveBeenNthCalledWith(
      3,
      hasuraMock,
      {
        Id: RISK_ID,
        ObjectType: ParentTypeEnum.Risk,
        ancestorContributors: [],
      },
      {
        Id: CONTROL_ID_1,
        ObjectType: ParentTypeEnum.Control,
        ancestorContributors: [],
      }
    );

    expect(result.statusCode).toEqual(200);
  });

  it('should unlink child_parent records by swapping source and target', async () => {
    getLinkedItemsMock.mockImplementation(async () => {
      return [
        {
          Id: LINK_ID1,
          Source: ISSUE_ID_1,
          Target: RISK_ID,
          RelationshipType: 'child_parent',
        },
        {
          Id: LINK_ID2,
          Source: ACTION_ID_1,
          Target: RISK_ID,
          RelationshipType: 'child_parent',
        },
      ];
    });
    getNodeMock.mockImplementation(async (_, id) => {
      switch (id) {
        case RISK_ID:
          return {
            Id: RISK_ID,
            ObjectType: ParentTypeEnum.Risk,
            ancestorContributors: [],
          };
        case ISSUE_ID_1:
          return {
            Id: ISSUE_ID_1,
            ObjectType: ParentTypeEnum.Issue,
            ancestorContributors: [],
          };
        case ACTION_ID_1:
          return {
            Id: ACTION_ID_1,
            ObjectType: ParentTypeEnum.Action,
            ancestorContributors: [],
          };
      }
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'insertLinkedItem',
          input: { Ids: [LINK_ID1, LINK_ID2] },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );

    expect(deleteLinkedItemsMock).toHaveBeenCalledWith(hasuraMock, {
      Ids: [],
    });

    expect(deleteParentChildLinkMock).toHaveBeenCalledTimes(2);
    expect(deleteParentChildLinkMock).toHaveBeenNthCalledWith(
      1,
      hasuraMock,
      {
        Id: RISK_ID,
        ObjectType: ParentTypeEnum.Risk,
        ancestorContributors: [],
      },
      {
        Id: ISSUE_ID_1,
        ObjectType: ParentTypeEnum.Issue,
        ancestorContributors: [],
      }
    );
    expect(deleteParentChildLinkMock).toHaveBeenNthCalledWith(
      2,
      hasuraMock,
      {
        Id: RISK_ID,
        ObjectType: ParentTypeEnum.Risk,
        ancestorContributors: [],
      },
      {
        Id: ACTION_ID_1,
        ObjectType: ParentTypeEnum.Action,
        ancestorContributors: [],
      }
    );

    expect(result.statusCode).toEqual(200);
  });
});
