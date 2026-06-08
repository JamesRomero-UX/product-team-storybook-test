import { randomUUID } from 'crypto';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import { InternalServerError } from 'http-errors';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { addRiskAssessmentResult } from './assessmentResult';

vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('crypto');

describe('addRiskAssessmentResult', () => {
  const mockedApiClient = mock<Sdk>({
    insertRiskAssessmentResults: vi.fn(),
  });

  const mockRiskId = 'test-risk-id-123';
  const mockUUID = '550e8400-e29b-41d4-a716-446655440000';
  const mockImpact = 3;
  const mockLikelihood = 2;
  const mockRating = 6;

  const randomUUIDMock = vi.mocked(randomUUID);

  beforeEach(() => {
    vi.resetAllMocks();
    randomUUIDMock.mockReturnValue(mockUUID);
  });

  describe('when all required parameters are provided', () => {
    it('should successfully create a risk assessment result', async () => {
      const mockResult = {
        insert_risk_assessment_result: {
          affected_rows: 1,
        },
      };

      vi.mocked(mockedApiClient.insertRiskAssessmentResults).mockResolvedValue(
        mockResult
      );

      const jiraRiskAssessmentResult = {
        riskId: mockRiskId,
        impact: mockImpact,
        likelihood: mockLikelihood,
        rating: mockRating,
      };

      await addRiskAssessmentResult(mockedApiClient, jiraRiskAssessmentResult);

      expect(mockedApiClient.insertRiskAssessmentResults).toHaveBeenCalledWith({
        results: {
          Id: mockUUID,
          TestDate: expect.any(String),
          Impact: mockImpact,
          Likelihood: mockLikelihood,
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          Rating: mockRating,
          parents: {
            data: [
              {
                ParentId: mockRiskId,
                ParentType: ParentTypeEnum.Risk,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
            ],
          },
        },
      });

      expect(mockedApiClient.insertRiskAssessmentResults).toHaveBeenCalledTimes(
        1
      );
    });

    describe('when required parameters are missing', () => {
      const mockAssessmentResult = {
        riskId: mockRiskId,
        impact: mockImpact,
        likelihood: mockLikelihood,
        rating: mockRating,
      };
      it.each(['impact', 'likelihood', 'rating'])(
        'should skip adding an assessment result when %s is missing',
        async (field) => {
          await addRiskAssessmentResult(mockedApiClient, {
            ...mockAssessmentResult,
            [field]: undefined,
          });

          expect(
            mockedApiClient.insertRiskAssessmentResults
          ).not.toHaveBeenCalled();
        }
      );

      it('should skip assessment result creation when all optional fields are undefined', async () => {
        const jiraRiskAssessmentResult = {
          riskId: mockRiskId,
          impact: undefined,
          likelihood: undefined,
          rating: undefined,
        };

        await addRiskAssessmentResult(
          mockedApiClient,
          jiraRiskAssessmentResult
        );

        expect(
          mockedApiClient.insertRiskAssessmentResults
        ).not.toHaveBeenCalled();
      });
    });

    describe('when API call fails', () => {
      it('should throw InternalServerError when API returns null result', async () => {
        vi.mocked(
          mockedApiClient.insertRiskAssessmentResults
        ).mockResolvedValue(null as never);

        const jiraRiskAssessmentResult = {
          riskId: mockRiskId,
          impact: mockImpact,
          likelihood: mockLikelihood,
          rating: mockRating,
        };

        await expect(
          addRiskAssessmentResult(mockedApiClient, jiraRiskAssessmentResult)
        ).rejects.toThrow(InternalServerError);

        await expect(
          addRiskAssessmentResult(mockedApiClient, jiraRiskAssessmentResult)
        ).rejects.toThrow('Failed to insert risk assessment result for risk');
      });

      it('should throw InternalServerError when API returns 0 affected rows', async () => {
        const mockResult = {
          insert_risk_assessment_result: {
            affected_rows: 0,
          },
        };

        vi.mocked(
          mockedApiClient.insertRiskAssessmentResults
        ).mockResolvedValue(mockResult);

        const jiraRiskAssessmentResult = {
          riskId: mockRiskId,
          impact: mockImpact,
          likelihood: mockLikelihood,
          rating: mockRating,
        };

        await expect(
          addRiskAssessmentResult(mockedApiClient, jiraRiskAssessmentResult)
        ).rejects.toThrow(InternalServerError);

        await expect(
          addRiskAssessmentResult(mockedApiClient, jiraRiskAssessmentResult)
        ).rejects.toThrow('Failed to insert risk assessment result for risk');
      });
    });
  });
});
