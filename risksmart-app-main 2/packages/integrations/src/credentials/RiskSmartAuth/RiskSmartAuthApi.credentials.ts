import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class RiskSmartAuthApi implements ICredentialType {
  name = 'riskSmartAuthApi';
  displayName = 'RiskSmart API Auth';
  documentationUrl = 'riskSmartAuthApi';
  icon: Icon = 'file:icon.png';

  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'client_credentials',
    },
    {
      displayName: 'Auth0 Domain',
      name: 'domain',
      type: 'string',
      required: true,
      default: 'our-auth0-domain-domain.uk.auth0.com',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      required: true,
      default: '',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      required: true,
      default: '',
    },
    {
      displayName: 'API Identifier',
      name: 'apiIdentId',
      type: 'string',
      required: true,
      default: 'https://your-api-target',
    },
    {
      displayName: 'Tenant Identifier',
      name: 'tenantIdentId',
      type: 'string',
      required: true,
      default: 'multitenant',
    },
  ];
}
