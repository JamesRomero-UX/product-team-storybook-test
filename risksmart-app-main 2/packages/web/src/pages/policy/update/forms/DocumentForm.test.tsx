import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetDocumentListResponse } from 'src/testing/mock-data/mockedGetDocumentsListResponse';
import { mockedGetDocumentsResponse } from 'src/testing/mock-data/mockedGetDocumentsResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetGlobalUsersAndGroupsResponse } from 'src/testing/mock-data/mockedGetGlobalUsersAndGroupsResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './DocumentForm';
import DocumentForm from './DocumentForm';

describe('DocumentForm', () => {
  const defaultProps: Props = { onSave: vi.fn() };

  it("has the header 'Details", async () => {
    render(<DocumentForm {...defaultProps} />, {
      wrapper: getWrapper(
        [
          mockedDepartmentsResponse,
          mockedGetDocumentsResponse({ filesWhere: {}, where: {} }),
          mockedTagsResponse,
          mockedUserGroupResponse(),
          mockedGetDocumentListResponse({}),
          mockedUsersResponse(),
          mockedUserSearchPreferencesResponses(),
          mockedGetGlobalUsersAndGroupsResponse(),
          mockedRoleAccessResponse(),
          mockedGetOrganisationModuleResponse(),
          mockedGetFormCustomisationResponse([Parent_Type_Enum.Document]),
          mockedGetOrganisation({
            auth_organisation: [{ Meta: { features: '' }, ScimEnabled: false }],
          }),
        ],
        'router',
        'graphql',
        'permission',
        'features',
        'trpc'
      ),
    });

    expect(await screen.findByText('Details')).toBeInTheDocument();
  });
});
