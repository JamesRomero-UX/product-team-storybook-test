import { mockedDepartmentsResponse } from './mockedDepartmentTypeResponses';
import { mockedGetLatestRiskAssessmentResultConfig } from './mockedGetLatestRiskAssessmentResultConfig';
import { mockedGetOrganisation } from './mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from './mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from './mockedGetRoleAccessResponse';
import { mockedTagsResponse } from './mockedTagTypeResponses';
import { mockedUserGroupResponse } from './mockedUserGroupResponses';
import { mockedUsersResponse } from './mockedUserResponses';

export const defaultMocks = [
  mockedGetOrganisation(),
  mockedUsersResponse(),
  mockedUserGroupResponse(),
  mockedRoleAccessResponse(),
  mockedGetOrganisationModuleResponse(),
  mockedTagsResponse,
  mockedDepartmentsResponse,
  mockedGetLatestRiskAssessmentResultConfig(),
];
