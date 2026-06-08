import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import {
  Appetite_Model_Enum,
  Appetite_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { when } from 'jest-when';
import {
  findCustomisableFormContent,
  getFormField,
  getSaveButton,
} from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetImpactListResponse } from 'src/testing/mock-data/mockedGetImpactListResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { defaultMocks } from '../../../../testing/mock-data';
import AppetiteForm from './AppetiteForm';
import { TestIds } from './AppetiteFormFieldsTestIds';

vi.mock('@/hooks/useIsModuleEnabled');

describe('AppetiteForm', () => {
  const providers: Providers[] = [
    'i18n',
    'router',
    'graphql',
    'permission',
    'features',
    'trpc',
    'notification',
  ];
  const mocks = [
    ...defaultMocks,
    mockedGetOrganisation(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Appetite]),
    mockedGetAggregationResponse(),
    mockedGetImpactListResponse(),
    mockedGetImpactListResponse(),
  ];

  it('displays warning when readonly and appetiteAggregation="top_down_cascade"', async () => {
    const { container } = render(
      <AppetiteForm
        onSave={vi.fn()}
        readOnly={true}
        appetiteAggregation={Appetite_Model_Enum.TopDownCascade}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    const alert = createWrapper(container).findAlert();
    expect(alert!.getElement()).toBeInTheDocument();
    expect(alert!.findContent().getElement().textContent).toEqual(
      'This appetite can only be edited via the parent risk.'
    );
  });

  it('hides warning when readonly and appetiteAggregation="default"', async () => {
    const { container } = render(
      <AppetiteForm
        onSave={vi.fn()}
        readOnly={true}
        appetiteAggregation={Appetite_Model_Enum.Default}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    const alert = createWrapper(container).findAlert();
    expect(alert).toBeNull();
  });

  it('does NOT show appetite type dropdown when impacts is disabled', async () => {
    when(useIsModuleEnabled)
      .calledWith('risk.subModules.impact')
      .mockReturnValue(false);
    const { container } = render(
      <AppetiteForm
        onSave={vi.fn()}
        readOnly={true}
        appetiteAggregation={Appetite_Model_Enum.Default}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    const appetiteType = getFormField(container, TestIds.AppetiteType);
    expect(appetiteType).toBeNull();
  });

  it('requires upper appetite when risk type selected', async () => {
    const { container } = render(
      <AppetiteForm
        onSave={vi.fn()}
        values={{
          files: [],
          AppetiteType: Appetite_Type_Enum.Risk,
          UpperAppetite: null,
        }}
        appetiteAggregation={Appetite_Model_Enum.Default}
      />,
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await findCustomisableFormContent();
    await userEvent.click(getSaveButton());
    await waitFor(() => {
      const upperAppetite = getFormField(container, TestIds.UpperAppetite);
      expect(upperAppetite!.findError()!.getElement().textContent).toEqual(
        'Required'
      );
    });
  });

  describe('when impacts is enabled', () => {
    beforeEach(() => {
      when(useIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);
    });

    it('shows the appetite type dropdown', async () => {
      const { container } = render(
        <AppetiteForm
          onSave={vi.fn()}
          appetiteAggregation={Appetite_Model_Enum.Default}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await findCustomisableFormContent();
      const appetiteType = getFormField(container, TestIds.AppetiteType);
      expect(appetiteType).not.toBeNull();
    });

    it('shows the likelihood appetite dropdown when likelihood type selected', async () => {
      const { container } = render(
        <AppetiteForm
          onSave={vi.fn()}
          values={{ files: [], AppetiteType: Appetite_Type_Enum.Likelihood }}
          appetiteAggregation={Appetite_Model_Enum.Default}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await findCustomisableFormContent();

      await waitFor(() => {
        const likelihoodAppetite = getFormField(
          container,
          TestIds.LikelihoodAppetite
        );
        expect(likelihoodAppetite).not.toBeNull();
      });
    });

    it('requires likelihood appetite when likelihood type selected', async () => {
      const { container } = render(
        <AppetiteForm
          onSave={vi.fn()}
          values={{ files: [], AppetiteType: Appetite_Type_Enum.Likelihood }}
          appetiteAggregation={Appetite_Model_Enum.Default}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await findCustomisableFormContent();
      await userEvent.click(getSaveButton());

      await waitFor(() => {
        const likelihoodAppetite = getFormField(
          container,
          TestIds.LikelihoodAppetite
        );
        expect(
          likelihoodAppetite!.findError()!.getElement().textContent
        ).toEqual('Required');
      });
    });

    it('requires impact when impact type selected', async () => {
      const { container } = render(
        <AppetiteForm
          onSave={vi.fn()}
          values={{ files: [], AppetiteType: Appetite_Type_Enum.Impact }}
          appetiteAggregation={Appetite_Model_Enum.Default}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await findCustomisableFormContent();
      await userEvent.click(getSaveButton());

      await waitFor(() => {
        const impact = getFormField(container, TestIds.Impact);
        expect(impact!.findError()!.getElement().textContent).toEqual(
          'Required'
        );
      });
    });
  });
});
