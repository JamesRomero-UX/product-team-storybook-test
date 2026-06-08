import type { UserStatusEnum } from 'generated/graphql';

interface ScimMeta {
  resourceType: string;
  created?: string;
  lastModified?: string;
  version?: string;
  location?: string;
}

interface ScimResource {
  schemas: string[];
  id: string;
  externalId?: string;
  meta?: ScimMeta;
}

export type ScimUser = ScimResource & {
  userName?: string;
  name?: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
    middleName?: string;
    honorificPrefix?: string;
    honorificSuffix?: string;
  };
  displayName?: string;
  nickName?: string;
  profileUrl?: string;
  title?: string;
  userType?: string;
  preferredLanguage?: string;
  locale?: string;
  timezone?: string;
  active?: boolean;
  emails?: {
    value: string;
    type?: string;
    primary?: boolean;
  }[];
  phoneNumbers?: {
    value: string;
    type?: string;
    primary?: boolean;
  }[];
  ims?: {
    value: string;
    type?: string;
  }[];
  photos?: {
    value: string;
    type?: string;
  }[];
  addresses?: {
    formatted?: string;
    streetAddress?: string | null;
    locality?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
    type?: string | null;
    primary?: boolean | null;
  }[];
  groups?: {
    value: string;
    $ref?: string;
    display?: string;
  }[];
  entitlements?: {
    value: string;
    type?: string;
  }[];
  roles?: {
    value: string;
    type?: string;
  }[];
  x509Certificates?: {
    value: string;
    type?: string;
  }[];
};

export type ScimEnterpriseUser = ScimUser & {
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'?: {
    employeeNumber?: string;
    costCenter?: string;
    organization?: string;
    division?: string;
    department?: string;
    manager?: {
      value: string;
      $ref?: string;
      displayName?: string;
    };
  };
};

export interface ScimError {
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'];
  detail?: string;
  status: string;
}

export interface ScimList {
  schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
  totalResults: number;
  itemsPerPage: number;
  startIndex: number;
  Resources: ScimResource[];
}

export interface ScimFilter {
  op?: string;
  left?: ScimFilter;
  right?: ScimFilter;
  attribute?: string;
  operator?: string;
  value?: string;
}

export interface ScimPatchOperation {
  op: 'replace' | 'add' | 'Add' | 'Replace' | 'remove' | 'Remove';
  path?: string | undefined;

  value?:
    | string
    | boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any[]
    | Record<string, string | number | boolean>
    | undefined;
}

// TODO: Move this to a more appropriate location
export interface HasuraUser {
  Id: string;
  FirstName?: string | null;
  LastName?: string | null;
  UserName?: string | null;
  Email?: string | null;
  Status: UserStatusEnum;
  CreatedOn?: string | null;
  External_Id?: string | null;
  DisplayName?: string | null;
  JobTitle?: string | null;
  Department?: string | null;
  OfficeLocation?: string | null;
  organisationusers: Array<{
    OrgKey?: string;
    RoleKey?: string | null;
    External_Id?: string | null;
    LastSeen?: string | null;
  }>;
}

export interface ScimLegacyTokenMetaData {
  id: string;
  orgKey: string;
  domains: string[];
  tenant: string;
  revoked?: boolean;
}

export interface ScimTokenMetaData {
  client_id: string;
  key_id: string;
  tenant: string;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  revoked_at: string | null;
  token_version: string;
  last_used_at: string | null;
}

export interface ScimDomain {
  domain: string;
  createdOn: string;
}

export interface ScimDomainsMetaData {
  client_id: string;
  key_id: string;
  domains: ScimDomain[];
}
