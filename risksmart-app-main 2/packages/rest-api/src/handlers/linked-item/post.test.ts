import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { NodeService } from 'src/services/node/node.service';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { insertParentChildLink } from './linkInserter';
import { handler } from './post';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/linked-item/linkedItemService');
vi.mock('src/services/node/node.service');
vi.mock('./linkInserter');

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

const mockedNodeService = vi.mocked(NodeService);
const insertParentChildLinkMock = vi.mocked(insertParentChildLink);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);

describe('linked item post', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
    mockedNodeService.mockReturnValue(mockNodeService);
  });

  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });

  it('returns bad request when node does not exist', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Document,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    mockNodeService.findById.mockResolvedValue(undefined);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            Source: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Targets: ['14897e55-02f6-483f-ada5-8986cc7e2ffa'],
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"error":"either source or targets do not exist"}'
    );
  });

  const nodeA = 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d';
  const nodeB = '14897e55-02f6-483f-ada5-8986cc7e2ffa';
  it.each`
    source                                                                  | target                                                                  | expectedSource | expectedTarget | expectedRelationshipType
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.TestResult }}                 | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Assessment }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.RiskAssessmentResult }}       | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationAssessmentResult }} | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentAssessmentResult }}   | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Impact }}                     | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ImpactRating }}               | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Appetite }}                   | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Acceptance }}                 | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ActionUpdate }}               | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Indicator }}                  | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.IndicatorResult }}            | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Issue }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Cause }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Consequence }}                | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.IssueAssessment }}            | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Obligation }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Document }}                   | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentFile }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Risk }}                       | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ControlGroup }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.TestResult }}                 | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Assessment }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationAssessmentResult }} | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.RiskAssessmentResult }}       | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentAssessmentResult }}   | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationImpact }}           | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ActionUpdate }}               | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Issue }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.IssueUpdate }}                | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Cause }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Consequence }}                | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.IssueAssessment }}            | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Document }}                   | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Risk }}                       | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Obligation }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Acceptance }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Assessment }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentAssessmentResult }}   | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationAssessmentResult }} | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.RiskAssessmentResult }}       | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ActionUpdate }}               | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentFile }}               | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Issue }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.IssueUpdate }}                | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Cause }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Consequence }}                | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Risk }}                       | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Obligation }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Document }}                   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ImpactRating }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.ControlGroup }}               | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Risk }}                       | ${nodeB}       | ${nodeA}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.TestResult }}                 | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Assessment }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Indicator }}                  | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.IndicatorResult }}            | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentFile }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Control }}                    | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationImpact }}           | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Action }}                     | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Action }}                     | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeB}       | ${nodeA}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Action }}                     | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Cause }}                      | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Action }}                     | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Consequence }}                | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Action }}                     | ${{ Id: nodeB, ObjectType: ParentTypeEnum.TestResult }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Action }}                     | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentFile }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Consequence }}                | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Acceptance }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Issue }}                      | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentFile }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.TestResult }}                 | ${nodeA}       | ${nodeB}       | ${'parent_child'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationImpact }}           | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ImpactRating }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Risk }}                       | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Document }}                   | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ControlGroup }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Indicator }}                  | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.Assessment }}                 | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Obligation }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.DocumentAssessmentResult }}   | ${{ Id: nodeB, ObjectType: ParentTypeEnum.RiskAssessmentResult }}       | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.ObligationAssessmentResult }} | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentAssessmentResult }}   | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.ObligationAssessmentResult }} | ${{ Id: nodeB, ObjectType: ParentTypeEnum.RiskAssessmentResult }}       | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Consequence }}                | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Acceptance }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Issue }}                      | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Action }}                     | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.DocumentFile }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.TestResult }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ObligationImpact }}           | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ImpactRating }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Document }}                   | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Risk }}                       | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Control }}                    | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.ControlGroup }}               | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Indicator }}                  | ${nodeA}       | ${nodeB}       | ${'sibling'}
    ${{ Id: nodeA, ObjectType: ParentTypeEnum.AssessmentActivity }}         | ${{ Id: nodeB, ObjectType: ParentTypeEnum.Obligation }}                 | ${nodeA}       | ${nodeB}       | ${'sibling'}
  `(
    '$source.ObjectType -> $target.ObjectType is a $expectedRelationshipType relationship',
    async ({
      source,
      target,
      expectedSource,
      expectedTarget,
      expectedRelationshipType,
    }) => {
      mockNodeService.findManyByIds.mockResolvedValue([
        {
          ObjectType: target.ObjectType,
          Id: target.Id,
          ancestorContributors: [],
        },
      ]);
      mockNodeService.findById.mockResolvedValue({
        ObjectType: source.ObjectType,
        Id: source.Id,
        ancestorContributors: [],
      });

      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'insertLinkedItem',
            input: {
              Source: source.Id,
              Targets: [target.Id],
            },
            session_variables: {
              'x-hasura-tenant-name': 'MultiTenant',
            },
          }),
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      if (expectedRelationshipType === 'parent_child') {
        expect(insertParentChildLinkMock).toHaveBeenCalledWith(
          hasuraMock,
          expectedSource === source.Id
            ? { ...source, ancestorContributors: [] }
            : { ...target, ancestorContributors: [] },
          expectedTarget === target.Id
            ? { ...target, ancestorContributors: [] }
            : { ...source, ancestorContributors: [] }
        );
      }
      if (expectedRelationshipType !== 'parent_child') {
        expect(insertParentChildLinkMock).not.toHaveBeenCalled();
      }
      expect(result.body).toEqual(
        JSON.stringify({
          Links: [
            {
              Source: expectedSource,
              Target: expectedTarget,
              RelationshipType: expectedRelationshipType,
            },
          ],
        })
      );
    }
  );
});
