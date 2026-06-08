export interface TenantConfig {
  tenant: string;
  region: string;
  databases: {
    secretArn: string;
    type: 'reader' | 'writer';
  }[];
}

export interface OrganisationConfig {
  orgKey: string;
  organisation: string;
}
