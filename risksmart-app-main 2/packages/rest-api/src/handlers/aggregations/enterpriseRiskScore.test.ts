import { getRatingByRange } from '@risksmart-app/i18n/src/ratings';
import { InsertEnterpriseRiskScoresDocument } from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';

import { recalculate } from './enterpriseRiskScore';

describe('Enterprise Risk Score', () => {
  vi.mock('src/backendGraphqlClient');
  vi.mock('src/adminGraphqlClient', async () => ({
    getHasuraAdminClient: () => ({
      query: async () => ({
        data: {
          risk_score: [
            {
              ResidualScore: 3,
              InherentScore: 5,
              risk: {
                enterpriseRiskInstance: {
                  RiskId: 'risk-1',
                  EnterpriseRiskId: 'enterprise-risk-1',
                  EntityId: 'entity-1',
                },
              },
            },
            {
              ResidualScore: 1,
              InherentScore: 3,
              risk: {
                enterpriseRiskInstance: {
                  RiskId: 'risk-2',
                  EnterpriseRiskId: 'enterprise-risk-1',
                  EntityId: 'entity-2',
                },
              },
            },
            {
              ResidualScore: 2,
              InherentScore: 4,
              risk: {
                enterpriseRiskInstance: {
                  RiskId: 'risk-3',
                  EnterpriseRiskId: 'enterprise-risk-1',
                  EntityId: 'entity-3',
                },
              },
            },
            {
              ResidualScore: 1,
              InherentScore: 5,
              risk: {
                enterpriseRiskInstance: {
                  RiskId: 'risk-4',
                  EnterpriseRiskId: 'enterprise-risk-2',
                  EntityId: 'entity-1',
                },
              },
            },
            {
              ResidualScore: 4,
              InherentScore: 5,
              risk: {
                enterpriseRiskInstance: {
                  RiskId: 'risk-5',
                  EnterpriseRiskId: 'enterprise-risk-2',
                  EntityId: 'entity-1',
                },
              },
            },
          ],
        },
      }),
    }),
  }));
  vi.mock('@risksmart-app/i18n/src/ratings');
  vi.mock('src/i18n');
  vi.mock('@risksmart-app/i18n/src/i18n');

  const mockedMutate = vi.fn();
  const getHasuraBackendClientMock = vi.mocked(getHasuraBackendClient);
  const getRatingByRangeMock = vi.mocked(getRatingByRange);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should calculate enterprise risk scores', async () => {
    // @ts-ignore
    getHasuraBackendClientMock.mockReturnValue({
      mutate: mockedMutate,
    });

    await recalculate('org-key', 'tenant');

    expect(getRatingByRangeMock).toHaveBeenCalledTimes(14);
    expect(mockedMutate).toHaveBeenCalledWith({
      mutation: InsertEnterpriseRiskScoresDocument,
      variables: {
        objects: expect.arrayContaining([
          expect.objectContaining({
            EnterpriseRiskId: 'enterprise-risk-1',
            InherentScoreMean: 4,
            ResidualScoreMean: 2,
            InherentScoreWorstCase: 5,
            ResidualScoreWorstCase: 3,
            InherentScoreMedian: [4],
            ResidualScoreMedian: [2],
          }),
          expect.objectContaining({
            EnterpriseRiskId: 'enterprise-risk-2',
            InherentScoreMean: 5,
            ResidualScoreMean: 2.5,
            InherentScoreWorstCase: 5,
            ResidualScoreWorstCase: 4,
            InherentScoreMedian: [5, 5],
            ResidualScoreMedian: [1, 4],
          }),
        ]),
      },
    });
  });
});
