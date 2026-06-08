export interface IntegrationConfig {
  org_key: string;
  parent_type: string;
  integration_type: 'webhook';
  op: string[];
  webhook_config: {
    uri: string;
    headers: { string: string };
    auth: {
      headerName?: string | null;
      secretName?: string | null;
    };
  };
}

export interface Secrets {
  [key: string]: string;
}
