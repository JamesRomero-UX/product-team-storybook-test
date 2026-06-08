import { render, screen } from '@testing-library/react';
import { RiskAttribute } from 'src/pages/risk-dashboard/types';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { defaultMocks } from 'src/testing/mock-data';
import { getWrapper } from 'src/testing/wrapper';

import { buildRiskRegisterFields } from '../../../testing/test-data/riskRegisterFields';
import type { Props } from './RiskType';
import RiskType from './RiskType';

describe('RiskType', () => {
  const defaultProps: Props = {
    selectedRiskAttribute: RiskAttribute.ControlledRating,
    risks: [],
    selectedInternalAuditEntityId: '1',
    loading: false,
  };

  it.each([
    { selectedInternalAuditEntityId: 'id1', shouldExist: true },
    { selectedInternalAuditEntityId: undefined, shouldExist: false },
  ])(
    "should show 'Add' button when audit selected $shouldExist",
    async ({ selectedInternalAuditEntityId, shouldExist }) => {
      render(
        <RiskType
          {...defaultProps}
          selectedInternalAuditEntityId={selectedInternalAuditEntityId}
        />,
        {
          wrapper: getWrapper(
            defaultMocks,
            'graphql',
            'router',
            'permission',
            'features'
          ),
        }
      );
      await waitUntilLoaded();
      const addButton = screen.queryByText('Link risks');
      if (shouldExist) {
        expect(addButton).toBeInTheDocument();
      } else {
        expect(addButton).not.toBeInTheDocument();
      }
    }
  );

  it.each([
    {
      risks: [],
    },
    {
      risks: [
        buildRiskRegisterFields({
          Title: 'Risk 1',
        }),
      ],
    },
    {
      risks: [
        buildRiskRegisterFields({
          Title: 'Risk 1',
          Id: '1a',
        }),
        buildRiskRegisterFields({
          Title: 'Risk A',
          Id: '2a',
        }),
        buildRiskRegisterFields({
          Title: 'Risk Z',
          Id: '3a',
        }),
        buildRiskRegisterFields({
          Title: 'Risk 3',
          Id: '4a',
        }),
      ],
    },
  ])('should render the title in a card for each risk', async ({ risks }) => {
    render(<RiskType {...defaultProps} risks={risks} />, {
      wrapper: getWrapper(
        defaultMocks,
        'graphql',
        'router',
        'permission',
        'features'
      ),
    });
    await waitUntilLoaded();
    for (const risk of risks) {
      const addButton = screen.queryByText(risk.Title);
      expect(addButton).toBeInTheDocument();
    }
    const cards = screen.queryAllByLabelText('Item selection', {
      exact: false,
    });
    expect(cards.length).toBe(risks.length);
  });
});
