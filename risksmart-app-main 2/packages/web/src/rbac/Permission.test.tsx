import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { hasPermission } from './hasPermission';
import type { HasAccessOptions } from './Permission';

describe('HasAccess', () => {
  const userId = 'userId123';

  describe('hasPermission', () => {
    it.each([
      {
        expectedHasAccess: true,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Any,
      },
      {
        expectedHasAccess: true,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Contributor,
      },
      {
        expectedHasAccess: true,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Owner,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Update,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Any,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Update,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Contributor,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Action,
        contributorType: Contributor_Type_Enum.Any,
      },
    ])(
      'should return $expectedHasAccess when requesting risk read access when canHaveAccessAsContributor=true if the user has only $accessType $objectType access for $contributorType contributor and no paren object is suplied',
      ({ expectedHasAccess, accessType, objectType, contributorType }) => {
        const options: HasAccessOptions = {
          objectType: Parent_Type_Enum.Risk,
          accessType: Access_Type_Enum.Read,
          canHaveAccessAsContributor: true,
          roleAccess: [
            {
              AccessType: accessType,
              ContributorType: contributorType,
              ObjectType: objectType,
            },
          ],
          userId,
        };

        expect(hasPermission(options)).toEqual(expectedHasAccess);
      }
    );

    it.each([
      {
        expectedHasAccess: true,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Any,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Contributor,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Owner,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Update,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Any,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Action,
        contributorType: Contributor_Type_Enum.Any,
      },
    ])(
      'should return $expectedHasAccess when requesting risk read access if the user has only $accessType $objectType access for $contributorType contributor and no parent object is supplied',
      ({ expectedHasAccess, accessType, objectType, contributorType }) => {
        const options: HasAccessOptions = {
          objectType: Parent_Type_Enum.Risk,
          accessType: Access_Type_Enum.Read,
          roleAccess: [
            {
              AccessType: accessType,
              ContributorType: contributorType,
              ObjectType: objectType,
            },
          ],
          userId,
        };

        expect(hasPermission(options)).toEqual(expectedHasAccess);
      }
    );

    it.each([
      {
        expectedHasAccess: true,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Any,
      },
      {
        expectedHasAccess: true,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Contributor,
      },
      {
        expectedHasAccess: false,
        accessType: Access_Type_Enum.Read,
        objectType: Parent_Type_Enum.Risk,
        contributorType: Contributor_Type_Enum.Owner,
      },
    ])(
      'should return $expectedHasAccess when requesting risk read access if the user has only $accessType $objectType access as $contributorType contributor, and is a contributor of the parent/object',
      ({ expectedHasAccess, accessType, objectType, contributorType }) => {
        const options: HasAccessOptions = {
          objectType: Parent_Type_Enum.Risk,
          accessType: Access_Type_Enum.Read,

          parentObject: {
            Id: '123',
            ancestorContributors: [
              {
                UserId: userId,
                ContributorType: Contributor_Type_Enum.Contributor,
              },
            ],
          },
          roleAccess: [
            {
              AccessType: accessType,
              ContributorType: contributorType,
              ObjectType: objectType,
            },
          ],
          userId,
        };

        expect(hasPermission(options)).toEqual(expectedHasAccess);
      }
    );
  });
});
