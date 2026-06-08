import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedGetTaxonomyAudit } from 'src/testing/mock-data/mockedGetTaxonomyAudit';
import { testAuth0User } from 'src/testing/testUser';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import Tab from './Tab';
import { defaultTaxonomy } from './taxonomyBuilder.testing';

vitest.mock('@risksmart-app/components/src/utils/environment');
vitest.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vitest.mock('@/hooks/useIsModuleEnabled');

const useRisksmartUserMock = vitest.mocked(useRisksmartUser);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);

// Mocking Json Editor to avoid error thrown after tests run due to the ace tokenizer after tests have completed.
vitest.mock(
  '@/components/form/controlled-json-editor/ControlledJsonEditor',
  () => ({
    ControlledJsonEditor: () => {
      return <div>{'Mock JSON Editor'}</div>;
    },
  })
);

describe('Taxonomy Tab', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(testAuth0User);
    useIsModuleEnabledMock.mockReturnValue(false);
    console.error = vitest.fn();
  });

  const deleteButton = () =>
    screen.getByRole<HTMLButtonElement>('button', { name: 'Delete' });

  const exportButton = () =>
    screen.getByRole<HTMLButtonElement>('button', { name: 'Export' });

  const saveButton = () =>
    screen.queryByRole<HTMLButtonElement>('button', { name: 'Save' });

  const versionDropdown = () => screen.queryByLabelText('Version');

  const addButton = () =>
    screen.queryByRole<HTMLButtonElement>('button', {
      name: 'Add Translations',
    });

  const showDefaultsCheckbox = () =>
    screen.queryByRole<HTMLButtonElement>('checkbox', {
      name: 'Show defaults',
    });

  const defaultVariables = {
    Locale: 'en',
    OrgKey: 'Org123',
  };

  describe('when loading', () => {
    beforeEach(async () => {
      render(<Tab />, {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetTaxonomyAudit(
              defaultVariables,
              { taxonomy_audit: [] },
              1000
            ),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...providers
        ),
      });

      await waitUntilLoaded();
    });

    it('should display Loading', async () => {
      expect(screen.findByTestId('loading-taxonomy')).toBeDefined();
    });

    it('Delete button is disabled', async () => {
      expect(deleteButton().disabled).toEqual(true);
    });

    it('Export button is disabled', async () => {
      expect(exportButton().disabled).toEqual(true);
    });

    it('Add Taxonomy button is not shown', () => {
      expect(addButton()).not.toBeInTheDocument();
    });
  });

  describe('when no taxonomy found', () => {
    beforeEach(async () => {
      render(<Tab />, {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetTaxonomyAudit(defaultVariables, { taxonomy_audit: [] }),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...providers
        ),
      });
      await waitUntilLoaded();
      await waitFor(() => !screen.findByTestId('loading-taxonomy'));
    });

    it('shows the no translations message', async () => {
      expect(screen.findByText('No translations found')).toBeDefined();
    });

    it('Delete button is disabled', async () => {
      expect(deleteButton().disabled).toEqual(true);
    });

    it('Export button is disabled', async () => {
      expect(exportButton().disabled).toEqual(true);
    });

    it('Add Translations button is shown', () => {
      expect(addButton()).toBeInTheDocument();
    });
  });

  describe('when taxonomy loaded', () => {
    beforeEach(async () => {
      render(<Tab />, {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Taxonomy]),
            mockedGetTaxonomyAudit(defaultVariables, {
              taxonomy_audit: [{ ...defaultTaxonomy, __typename: undefined }],
            }),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...providers
        ),
      });
      await waitUntilLoaded();
      await screen.findByText('Mock JSON Editor');
    });

    it('should display a code editor', async () => {
      expect(screen.getByText('Mock JSON Editor')).toBeDefined();
    });

    it('Delete button is enabled', async () => {
      expect(deleteButton().disabled).toEqual(false);
    });

    it('Export button is enabled', async () => {
      expect(exportButton().disabled).toEqual(false);
    });

    it('Add Translations button is not shown', () => {
      expect(addButton()).not.toBeInTheDocument();
    });

    it('Save button is shown', async () => {
      expect(saveButton()).toBeInTheDocument();
    });

    it('Version drop down is shown', async () => {
      expect(versionDropdown()).toBeInTheDocument();
    });

    describe("and 'Show defaults' is selected", () => {
      beforeEach(() => {
        fireEvent.click(showDefaultsCheckbox()!);
      });

      it('Delete button is disabled', async () => {
        expect(deleteButton().disabled).toEqual(true);
      });

      it('Save button is not shown', async () => {
        expect(saveButton()).not.toBeInTheDocument();
      });

      it('Version drop down is not shown', async () => {
        expect(versionDropdown()).not.toBeInTheDocument();
      });
    });
  });
});
