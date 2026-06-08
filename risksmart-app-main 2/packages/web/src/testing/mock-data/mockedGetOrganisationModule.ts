import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetModulesQuery,
  GetModulesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetModulesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetOrganisationModuleResponse = (): MockedResponse<
  GetModulesQuery,
  GetModulesQueryVariables
> => ({
  request: {
    query: GetModulesDocument,
  },
  result: {
    data: {
      organisation_module: [
        {
          ModuleSettings: {
            risk: {
              enabled: true,
              allowTabConfig: true,
              subModules: {
                impact: {
                  enabled: false,
                },
                risk_scoring: {
                  enabled: false,
                },
                appetite: {
                  enabled: true,
                },
                appetite_cascading: {
                  enabled: false,
                },
                acceptance: {
                  enabled: true,
                },
                rcsa_wizard: {
                  enabled: false,
                },
              },
            },
            document: {
              enabled: false,
              allowTabConfig: true,
              subModules: {
                attestation: {
                  enabled: false,
                },
                public_document: {
                  enabled: true,
                },
              },
            },
            obligation: {
              enabled: false,
              allowTabConfig: true,
              subModules: {
                compliance_monitoring: {
                  enabled: false,
                },
              },
            },
            third_party: {
              enabled: false,
              allowTabConfig: true,
            },
            internal_audit: {
              enabled: false,
            },
            issue: {
              enabled: true,
              allowTabConfig: true,
              subModules: {
                cause: {
                  enabled: true,
                },
                consequence: {
                  enabled: true,
                },
              },
            },
            control: {
              enabled: true,
              allowTabConfig: true,
              subModules: {
                control_group: {
                  enabled: false,
                },
              },
            },
            action: {
              enabled: true,
              allowTabConfig: true,
            },
            indicator: {
              enabled: true,
              allowTabConfig: false,
            },
            assessment: {
              enabled: true,
              allowTabConfig: true,
            },
            incident_reporting: {
              enabled: true,
            },
            approval: {
              enabled: false,
            },
            custom_datasource: {
              enabled: false,
            },
            notification: {
              enabled: true,
            },
            enterprise_risk: {
              enabled: false,
              allowTabConfig: true,
            },
          },
        },
      ],
    },
  },
});
