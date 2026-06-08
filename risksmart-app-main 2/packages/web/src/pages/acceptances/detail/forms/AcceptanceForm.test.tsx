import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import { findCustomisableFormContent } from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import AcceptanceForm from './AcceptanceForm';

vi.mock('@/utils/featureFlags');

describe('AcceptanceForm', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];
  it('shows status of Pending,Open,Closed and Declined', async () => {
    const { container } = render(<AcceptanceForm onSave={vi.fn()} />, {
      wrapper: getWrapper(
        [
          mockedGetOrganisation(),
          mockedRoleAccessResponse(),
          mockedGetOrganisationModuleResponse(),
          mockedGetOrganisationModuleResponse(),
          mockedGetFormCustomisationResponse([Parent_Type_Enum.Acceptance]),
          mockedUserGroupResponse(),
          mockedUsersResponse(),
          mockedTagsResponse,
          mockedDepartmentsResponse,
          mockedGetAggregationResponse(),
          mockedUserSearchPreferencesResponses(),
        ],
        ...providers
      ),
    });
    await findCustomisableFormContent();
    const radioButtons = createWrapper(container)
      .findRadioGroup()
      ?.findButtons();
    expect(radioButtons?.length).toEqual(4);
    expect(radioButtons?.[0].findLabel()?.getElement().textContent).toEqual(
      'Draft'
    );
    expect(radioButtons?.[1].findLabel()?.getElement().textContent).toEqual(
      'Open'
    );
    expect(radioButtons?.[2].findLabel()?.getElement().textContent).toEqual(
      'Closed'
    );
    expect(radioButtons?.[3].findLabel()?.getElement().textContent).toEqual(
      'Declined'
    );
  });
});
