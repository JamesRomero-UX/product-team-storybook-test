import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentColumns } from 'pdfmake/interfaces';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { vi } from 'vitest';

import { mockedFormConfigurationByParentTypeResponse } from '../../../testing/mock-data/mockedFormConfigurationByParentTypeResponses';
import { mockedGetActionsResponse } from '../../../testing/mock-data/mockedGetActionsResponse';
import { mockedGetControlsResponse } from '../../../testing/mock-data/mockedGetControlsResponses';
import { mockedGetIssuesByParentIdResponse } from '../../../testing/mock-data/mockedGetIssuesByParentIdResponse';
import { mockedGetThirdPartyByIdResponse } from '../../../testing/mock-data/mockedGetThirdPartyByIdResponse';
import {
  getExportedDocument,
  getPdfField,
} from '../../../testing/useExporterUtilities';
import { useExporter } from './useExporter';

vi.mock('@/utils/pdf/downloader');

describe('useExporter', () => {
  const thirdPartyId = '1';

  const thirdPartyGraphqlMock = mockedGetThirdPartyByIdResponse(
    { Id: thirdPartyId },
    {
      Id: thirdPartyId,
      SequentialId: 1,
      Title: 'random third party',
      Description: 'desc',
      CompanyName: 'company name',
      CompaniesHouseNumber: '123',
      Address: 'address',
      CityTown: 'city',
      Postcode: 'postcode',
      Country: 'country',
      PrimaryContactName: 'primary contact',
      ContactName: 'contact',
      ContactEmail: 'email',
      CompanyDomain: 'domain',
      Type: 'consultant',
      Status: 'active',
      Criticality: 2,
      CreatedByUser: 'user1',
      CreatedAtTimestamp: '2021-01-01T00:00:00Z',
      ModifiedByUser: 'user2',
      ModifiedAtTimestamp: '2021-01-02T00:00:00Z',
      owners: [
        {
          __typename: 'owner',
          UserId: '123',
          user: { __typename: 'user', FriendlyName: 'Kristian', Id: '123' },
        },
      ],
      ownerGroups: [
        {
          __typename: 'owner_group',
          UserGroupId: '456',
          group: { __typename: 'user_group', Name: 'Owners Group', users: [] },
        },
      ],
      contributors: [
        {
          __typename: 'contributor',
          UserId: '789',
          user: { __typename: 'user', FriendlyName: 'Marcell', Id: '789' },
        },
      ],
      contributorGroups: [
        {
          __typename: 'contributor_group',
          UserGroupId: '101112',
          group: {
            __typename: 'user_group',
            Name: 'Contributor Group',
            users: [],
          },
        },
      ],
      ancestorContributors: [],
      tags: [],
      departments: [],
      CustomAttributeData: null,
      files: [],
    }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Exports the correct data', async () => {
    const exportedDocument = await getExportedDocument(
      () => useExporter(thirdPartyId),
      [
        thirdPartyGraphqlMock,
        mockedFormConfigurationByParentTypeResponse([
          Parent_Type_Enum.ThirdParty,
        ]),
        mockedGetActionsResponse(
          { where: { parents: { ParentId: { _eq: thirdPartyId } } } },
          {
            action: [],
          }
        ),
        mockedGetIssuesByParentIdResponse(
          { ParentId: thirdPartyId, Type: Parent_Type_Enum.Issue },
          {
            issue: [],
          }
        ),
        mockedGetControlsResponse(
          { where: { parents: { ParentId: { _eq: thirdPartyId } } } },
          { control: [] }
        ),
        mockedGetFormCustomisationResponse([
          'action',
          'control',
          'issue_assessment',
          'issue',
          'third_party',
        ]),
      ]
    );

    expect(exportedDocument).toContainEqual({
      style: 'header',
      text: 'random third party',
    });

    const columns = (exportedDocument.find(
      (item) => typeof item === 'object' && 'columns' in item
    ) as ContentColumns | undefined)!.columns;

    expect(columns).toBeDefined();

    const fields = columns.flat();

    expect(getPdfField(fields, 'Description')).toEqual('desc');
    expect(getPdfField(fields, 'Company Name')).toEqual('company name');
    expect(getPdfField(fields, 'Companies House Number')).toEqual('123');
    expect(getPdfField(fields, 'Address')).toEqual('address');
    expect(getPdfField(fields, 'City/Town')).toEqual('city');
    expect(getPdfField(fields, 'Postcode')).toEqual('postcode');
    expect(getPdfField(fields, 'Country')).toEqual('country');
    expect(getPdfField(fields, 'Primary Contact Name')).toEqual(
      'primary contact'
    );
    expect(getPdfField(fields, 'Contact Name')).toEqual('contact');
    expect(getPdfField(fields, 'Contact Email')).toEqual('email');
    expect(getPdfField(fields, 'Company Domain')).toEqual('domain');
    expect(getPdfField(fields, 'Type')).toEqual('Consultant');
    expect(getPdfField(fields, 'Status')).toEqual('Active');
    expect(getPdfField(fields, 'Criticality')).toEqual('Low');
    expect(getPdfField(fields, 'Owner')).toEqual('Kristian, Owners Group');
    expect(getPdfField(fields, 'Contributor')).toEqual(
      'Marcell, Contributor Group'
    );
  });
});
