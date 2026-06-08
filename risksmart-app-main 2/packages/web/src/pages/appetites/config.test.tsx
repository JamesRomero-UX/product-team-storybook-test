import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getEmptyCollectionSlotText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ActiveRiskAppetiteFields } from './types';

describe('appetites config', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const id = 'ID';
  const guid = 'Guid';
  const TestHarness: FC<{ records: ActiveRiskAppetiteFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultAppetite: ActiveRiskAppetiteFields = {
    appetite: {
      Id: '50cc675c-5d74-4612-b7cb-0cfe40951386',
      LowerAppetite: 2,
      UpperAppetite: 5,
      ImpactAppetite: null,
      Statement: 'Appetite statement 3',
      EffectiveDate: '2024-05-03T00:00:00+00:00',
      AppetiteType: 'risk',
      CreatedAtTimestamp: '2024-06-26T12:02:15.714902+00:00',
      ModifiedAtTimestamp: '2024-06-26T12:02:15.714902+00:00',
      CreatedByUser: 'auth0|644151efc3a961d2784456d9',
      ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
      CustomAttributeData: null,
      SequentialId: 3,
      __typename: 'appetite',
      modifiedByUser: {
        FriendlyName: 'RiskManager1',
        __typename: 'user',
      },
    },
    risk: {
      Id: 'a1d30192-8100-46b1-a584-6db81b22f935',
      Tier: 1,
      Title: 'Scope Creep',
      SequentialId: 3,
      owners: [],
      ownerGroups: [],
      contributors: [],
      contributorGroups: [],
      assessmentResults: [],
      riskScore: null,
    },
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Risk,
      Parent_Type_Enum.Appetite,
    ]),
    mockedGetAggregationResponse(null, null),
    mockedGetUserTablePreferences('appetiteRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 6 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(6);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Risk name (risk)',
        'Risk tier (risk)',
        'Lower appetite',
        'Upper appetite',
        'Residual rating',
        'Appetite performance',
      ]);
    });

    it('should not show Upper and Lower Appetite, and instead show Posture when the posture feature flag is set to true', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(
          [
            mockedGetOrganisation({
              auth_organisation: [
                {
                  Meta: { features: 'posture' },
                  ScimEnabled: false,
                },
              ],
            }),
            ...testMocks,
          ],
          ...providers
        ),
      });
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();

      expect(options?.length).toEqual(17);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).not.toContain('Lower appetite');
      expect(displayOptionLabels).not.toContain('Upper appetite');
      expect(displayOptionLabels).toContain('Posture');
    });
    const expectedDisplayPreferenceFields = 18;
    it(`should have the option to display ${expectedDisplayPreferenceFields} fields`, async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(expectedDisplayPreferenceFields);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Risk name (risk)',
        'Risk tier (risk)',
        'Owners (risk)',
        'Contributors (risk)',
        'Lower appetite',
        'Upper appetite',
        'Residual rating',
        'Appetite performance',
        'Parent risk ID',
        'Parent risk guid',
        'Statement',
        'Created on',
        'Guid',
        'ID',
        'Updated on',
        'Updated by ID',
        'Updated by',
        'Effective date',
      ]);
    });

    it('should display the "Guid" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAppetite }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, guid);

      expect(getCellText(container, guid, 1)).toEqual(
        defaultAppetite.appetite?.Id
      );
    });

    it('should display the "Parent risk guid" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAppetite }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, 'Parent risk guid');

      expect(getCellText(container, 'Parent risk guid', 1)).toEqual(
        'a1d30192-8100-46b1-a584-6db81b22f935'
      );
    });

    it('should display the "Parent risk ID" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAppetite }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, 'Parent risk ID');

      expect(getCellText(container, 'Parent risk ID', 1)).toEqual('R-3');
    });

    it('should display the "Id" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAppetite }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, id);

      expect(getCellText(container, id, 1)).toEqual('APT-3');
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getEmptyCollectionSlotText(container, 0)).toEqual('No Appetites');
      expect(getEmptyCollectionSlotText(container, 1)).toEqual(
        'No appetites to display.'
      );
    });

    it('should support export in correct format', async () => {
      const { result } = renderHook(
        () => useGetCollectionTableProps([{ ...defaultAppetite }]),
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(result.current.exportToCsvString).toBeDefined()
      );
      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"Risk name (risk)","Risk tier (risk)","Lower appetite","Upper appetite","Residual rating","Appetite performance"\r\n' +
          '"Scope Creep","Tier 1","Low","Critical","Unrated","Undefined"'
      );
    });
  });
});
