import {
  Risk_Assessment_Result_Control_Type_Enum,
  Risk_Scoring_Model_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';

import { defaultMocks } from '../../testing/mock-data';
import { getWrapper } from '../../testing/wrapper';
import type { Props } from './RiskScoreBadge';
import { RiskScoreBadge } from './RiskScoreBadge';

describe('RiskScoreBadge', () => {
  const defaultProps: Props = {
    score: 12,
    rating: 3,
    likelihood: 1,
    impact: 2,
    controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    riskScoreModel: Risk_Scoring_Model_Enum.Default,
  };

  const getBackgroundColour = () =>
    screen.getByTestId('badge').style.backgroundColor;

  it('renders displays the score value', async () => {
    render(<RiskScoreBadge {...defaultProps} score={99.1} />, {
      wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
    });
    await waitFor(() => {
      expect(screen.getByText('99.1')).toBeInTheDocument();
    });
  });

  it.each([
    {
      rating: 3,
      badgeColour: '#F2A041', //orange
    },
    {
      rating: 5,
      badgeColour: '#CE1B1B', //dark red
    },
  ])(
    'for an aggregate scoring model, renders badge colour $badgeColour based on rating $rating',
    async ({ rating, badgeColour }) => {
      render(
        <RiskScoreBadge
          {...defaultProps}
          score={99.1}
          riskScoreModel={Risk_Scoring_Model_Enum.ControlEffectivenessAverages}
          rating={rating}
        />,
        { wrapper: getWrapper(defaultMocks, 'graphql', 'features') }
      );
      await waitFor(() => {
        expect(getBackgroundColour()).toEqual(badgeColour);
      });
    }
  );

  it.each([
    {
      impact: 3,
      likelihood: 4,
      badgeColour: '#F2A041', //orange
    },
    {
      impact: 3,
      likelihood: 2,
      badgeColour: '#8CC862', // light green
    },
  ])(
    'for default scoring model, renders badge colour $badgeColour based on impact $impact and likelihood $likelihood',
    async ({ impact, likelihood, badgeColour }) => {
      render(
        <RiskScoreBadge
          {...defaultProps}
          score={99.1}
          riskScoreModel={Risk_Scoring_Model_Enum.Default}
          impact={impact}
          likelihood={likelihood}
        />,
        { wrapper: getWrapper(defaultMocks, 'graphql', 'features') }
      );
      await waitFor(() => {
        expect(getBackgroundColour()).toEqual(badgeColour);
      });
    }
  );
});
