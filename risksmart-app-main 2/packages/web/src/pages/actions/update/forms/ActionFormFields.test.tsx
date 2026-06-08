import i18n from '@risksmart-app/i18n/src/i18n';
import {
  Action_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import { findCustomisableFormContent } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { TestFormProvider } from 'src/testing/TestFormProvider';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../../../testing/mock-data';
import ActionFormFields from './ActionFormFields';
import type { ActionFormFieldData } from './actionsSchema';
import { defaultValues } from './actionsSchema';

vi.mock('@risksmart-app/components/src/utils/environment');
vi.mock('@/utils/featureFlags');

describe('ActionForm', async () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  const renderActionForm = async (formValues: Partial<ActionFormFieldData>) => {
    render(
      <TestFormProvider
        values={{ ...defaultValues, ...formValues }}
        parentType={Parent_Type_Enum.Action}
      >
        <ActionFormFields />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Action]),
            mockedUserSearchPreferencesResponses(),
            mockedGetAggregationResponse(),
          ],
          ...providers
        ),
      }
    );
    await findCustomisableFormContent();
  };

  it('does NOT show closed date when status is open', async () => {
    await renderActionForm({
      Status: Action_Status_Enum.Open,
    });
    const closedDate = screen.queryAllByText(
      i18n.t('actions.fields.ClosedDate')
    );
    expect(closedDate[0]).not.toBeDefined();
  });

  it('shows closed date when status is closed', async () => {
    await renderActionForm({
      Status: Action_Status_Enum.Closed,
    });
    const closedDate = screen.queryAllByText(
      i18n.t('actions.fields.ClosedDate')
    );
    expect(closedDate[0]).toBeDefined();
  });
});
