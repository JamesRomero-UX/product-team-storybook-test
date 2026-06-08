import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './Tier';
import Tier from './Tier';
import { EnterpriseRiskAttribute } from './types';

describe('Tier', () => {
  const defaultProps: Props = {
    tier: 1,
    setDashboardState: vi.fn(),
    dashboardState: new Map(),
    tierRisks: [],
    selectedRiskAttribute: EnterpriseRiskAttribute.InherentMean,
    onSelectionChange: vi.fn(),
  };

  it.each([
    { tier: 1, contributorType: Contributor_Type_Enum.Any },
    { tier: 2, contributorType: Contributor_Type_Enum.Any },
    { tier: 3, contributorType: Contributor_Type_Enum.Any },
    { tier: 2, contributorType: Contributor_Type_Enum.Owner },
    { tier: 3, contributorType: Contributor_Type_Enum.Owner },
  ])(
    "should show 'Add' button for Tier $tier risks for users with insert:risk as $contributorType permissions",
    async ({ tier, contributorType }) => {
      render(<Tier {...defaultProps} tier={tier as 1 | 2 | 3} />, {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockedRoleAccessResponse({
              role_access: [
                {
                  ObjectType: Parent_Type_Enum.EnterpriseRisk,
                  AccessType: Access_Type_Enum.Insert,
                  ContributorType: contributorType,
                },
              ],
            }),
          ],
          'features',
          'notification',
          'permission',
          'trpc',
          'graphql',
          'router',
          'i18n'
        ),
      });
      await waitUntilLoaded();
      const addButton = screen.getByText('Add');
      expect(addButton).toBeInTheDocument();
    }
  );

  it.each([{ tier: 1, contributorType: Contributor_Type_Enum.Owner }])(
    "should NOT show 'Add' button for Tier $tier risks for users with insert:risk as $contributorType permissions",
    async ({ tier, contributorType }) => {
      render(<Tier {...defaultProps} tier={tier as 1 | 2 | 3} />, {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockedRoleAccessResponse({
              role_access: [
                {
                  ObjectType: Parent_Type_Enum.EnterpriseRisk,
                  AccessType: Access_Type_Enum.Insert,
                  ContributorType: contributorType,
                },
              ],
            }),
          ],
          'features',
          'notification',
          'permission',
          'trpc',
          'graphql',
          'router',
          'i18n'
        ),
      });
      await waitUntilLoaded();
      const addButton = screen.queryByText('Add');
      expect(addButton).not.toBeInTheDocument();
    }
  );
});
