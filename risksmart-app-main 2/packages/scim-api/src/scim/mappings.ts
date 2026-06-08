import type { AuthUserBoolExp } from 'generated/graphql';

import { fieldMappings } from './config';
import type {
  HasuraUser,
  ScimEnterpriseUser,
  ScimFilter,
  ScimUser,
} from './types';

export const createScimUserMapper = (attributes: string[] = []) => {
  const userAttributes = [
    'UserName',
    'Email',
    'FirstName',
    'LastName',
    'DisplayName',
    'JobTitle',
    'OfficeLocation',
    'Status',
    'External_Id',
    'Department',
  ];
  if (!attributes.length) {
    attributes = userAttributes;
  }
  const attributeMap: {
    [key: string]: (user: HasuraUser, scimUser: ScimEnterpriseUser) => void;
  } = {
    External_Id: (user, scimUser) => {
      const userOrg = user.organisationusers?.[0];
      if (userOrg.External_Id) {
        scimUser.externalId = userOrg.External_Id;
      }
    },
    UserName: (user, scimUser) => {
      if (user.UserName) {
        scimUser.userName = user.UserName;
      }
    },
    Email: (user, scimUser) => {
      if (user.Email) {
        scimUser.emails = [{ value: user.Email, primary: true, type: 'work' }];
      }
    },
    Status: (user, scimUser) => {
      scimUser.active = user.Status === 'active';
    },
    FirstName: (user, scimUser) => {
      if (user.FirstName) {
        scimUser.name = { ...scimUser.name, givenName: user.FirstName };
      }
    },
    LastName: (user, scimUser) => {
      if (user.LastName) {
        scimUser.name = { ...scimUser.name, familyName: user.LastName };
      }
    },
    DisplayName: (user, scimUser) => {
      if (user.DisplayName) {
        scimUser.name = { ...scimUser.name, formatted: user.DisplayName };
      }
    },
    JobTitle: (user, scimUser) => {
      if (user.JobTitle) {
        scimUser.title = user.JobTitle;
      }
    },
    Department: (user, scimUser) => {
      if (user.Department) {
        scimUser['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'] =
          { department: user.Department };
      }
    },
    OfficeLocation: (user, scimUser) => {
      if (user.OfficeLocation) {
        scimUser.addresses = [{ formatted: user.OfficeLocation, type: 'work' }];
      }
    },
  };
  const operations = attributes
    .map((attr) => attributeMap[attr])
    .filter(Boolean);

  return (user: HasuraUser): ScimUser => {
    const scimUser: ScimUser = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.Id,
      meta: {
        created: user.CreatedOn ?? undefined,
        resourceType: 'User',
      },
    };
    operations.forEach((op) => op(user, scimUser));

    return scimUser;
  };
};

export const mapScimFilterToHasura = (filter?: ScimFilter): AuthUserBoolExp => {
  if (!filter) {
    return {};
  }

  if (!filter.op) {
    // It's a simple expression
    const fieldName = mapScimAttributeToHasura(filter.attribute!);
    const operator = mapScimOperatorToHasura(
      filter.operator!,
      filter.attribute
    );
    // const value = filter.value;
    const value = mapScimValueToHasura(fieldName, filter.value);

    return {
      [fieldName]: { [operator]: value },
    };
  } else {
    // It's a logical expression
    switch (filter.op) {
      case 'and':
        return {
          _and: [
            mapScimFilterToHasura(filter.left),
            mapScimFilterToHasura(filter.right),
          ],
        };
      case 'or':
        return {
          _or: [
            mapScimFilterToHasura(filter.left),
            mapScimFilterToHasura(filter.right),
          ],
        };
      default:
        throw new Error('Unsupported logical operator: ' + filter.op);
    }
  }
};

export const mapScimAttributeToHasura = (attributeName: string): string => {
  switch (attributeName.toLowerCase()) {
    case 'id':
      return 'Id';
    case 'externalid':
      return 'External_Id';
    case 'username':
      return 'UserName';
    case 'email':
      return 'Email';
    case 'emails[type eq "work"].value':
      return 'Email';
    case 'active':
      return 'Status';
    case 'created':
      return 'CreatedOn';
    case 'name.given_name':
      return 'FirstName';
    case 'name.givenname':
      return 'FirstName';
    case 'name.family_name':
      return 'LastName';
    case 'name.familyname':
      return 'LastName';
    case 'name.formatted':
      return 'DisplayName';
    case 'title':
      return 'JobTitle';
    case 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:user:department':
      return 'Department';
    case 'addresses[type eq "work"].formatted':
      return 'OfficeLocation';
    default:
      return attributeName;
  }
};

export const mapScimOperatorToHasura = (
  operator: string,
  attributeName?: string
): string => {
  switch (operator) {
    case 'eq':
      return attributeName === 'active' ? '_eq' : '_ilike'; // instead of '_eq' for case-insensitive matching
    case 'ne':
      return '_ne';
    case 'co':
      return '_ilike'; // need to append and prepend '%' to the value
    case 'sw':
      return '_ilike'; // need to append '%' to the value
    case 'ew':
      return '_ilike'; // need to prepend '%' to the value
    case 'pr':
      return '_is_null'; // value should be false if present
    case 'gt':
      return '_gt';
    case 'ge':
      return '_gte';
    case 'lt':
      return '_lt';
    case 'le':
      return '_lte';
    default:
      throw new Error('Unsupported operator: ' + operator);
  }
};

export const mapScimValueToHasura = (
  fieldName: string,
  value: string | undefined
) => {
  if (fieldName === 'Status') {
    return value === 'true' ? 'active' : 'archived';
  }

  return value;
};

export const mapAuthContextToHasura = (
  filter?: AuthUserBoolExp,
  orgKey?: string,
  domains?: string[]
): AuthUserBoolExp => {
  const andFilter: AuthUserBoolExp[] = [];
  if (filter) {
    andFilter.push(filter);
  }
  if (orgKey) {
    andFilter.push({
      organisationusers: { OrgKey: { _eq: orgKey } },
    });
  }
  if (domains) {
    andFilter.push({
      _or: domains.map((domain) => ({ Email: { _ilike: `%@${domain}` } })),
    });
  }

  const filterWithAuthContext: AuthUserBoolExp = {
    _and: andFilter,
  };
  console.debug('filterJSON', JSON.stringify(filterWithAuthContext));

  return filterWithAuthContext;
};

export const mapScimUserToHasuraUpdate = (
  scimUser: ScimEnterpriseUser,
  isPut = false
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  fieldMappings.forEach(({ dbField, getScimValue, nullableOnPut }) => {
    const value = getScimValue(scimUser);
    if (value !== undefined) {
      result[dbField] = value;
    } else if (isPut && nullableOnPut) {
      result[dbField] = null;
    }
  });

  return result;
};
