export type ThirdPartyContactFields = {
  Id: string;
  ThirdPartyId: string;
  Email: string;
  Name: string | null;
  JobTitle: string | null;
  IsRevoked: boolean;
  PasswordSetAtTimestamp: string | null;
  CreatedAtTimestamp: string;
  ModifiedAtTimestamp: string;
  CreatedByUser: string | null;
  ModifiedByUser: string | null;
  user?: {
    LastSeen: string | null;
  } | null;
  [key: string]: unknown;
};

export type ThirdPartyContactWithStatus = ThirdPartyContactFields & {
  lastLogin: string | null;
  status: 'active' | 'pending' | 'revoked';
};

export interface CreateContactInput {
  thirdPartyId: string;
  email: string;
  name?: string;
  jobTitle?: string;
}
