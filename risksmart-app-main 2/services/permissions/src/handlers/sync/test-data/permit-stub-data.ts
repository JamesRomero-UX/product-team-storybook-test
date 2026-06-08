import type { GetAllDataResult } from '@risksmart-app/permitio/src/types.js';

import type { ResourceInstanceId } from '../branded-ids';
import { rsNodeId, userGroupId } from '../branded-ids';
import type { PermitTenant, ResourceInstance } from '../common';

export const GetAllDataResultStub: GetAllDataResult = {
  users: {
    'auth0|644151efc3a961d2784456d9': {
      roleAssignments: {
        org_Qshp7tYsxxAWwhVa: [
          'ActionManager',
          'IssueManager',
          'AssessmentManager',
          'PolicyManager',
          'RiskManager',
          'IndicatorManager',
          'CustomDataSourceManager',
          'SettingsManager',
          'Standard',
          'ControlManager',
          'InternalAuditManager',
          'ComplianceManager',
          'ThirdPartyManager',
        ],
        org_Qshp7tYsxxAWwhVb: ['ComplianceManager', 'Standard'],
      },
      attributes: {
        key: 'auth0|644151efc3a961d2784456d9',
      },
    },
    'auth0|644152102c766a09dd585d2e': {
      roleAssignments: {
        org_Qshp7tYsxxAWwhVa: ['Standard', 'ComplianceManager'],
        org_Qshp7tYsxxAWwhVb: ['ComplianceManager', 'Standard'],
      },
      attributes: {
        key: 'auth0|644152102c766a09dd585d2e',
      },
    },
    'auth0|6580670a706adf1843972000': {
      roleAssignments: {
        org_Qshp7tYsxxAWwhVa: ['Standard', 'RiskManager'],
        org_Qshp7tYsxxAWwhVb: ['CustomerSuccess', 'Standard'],
      },
      attributes: {
        key: 'auth0|6580670a706adf1843972000',
      },
    },
    'auth0|65806782706adf184397200b': {
      roleAssignments: {
        org_Qshp7tYsxxAWwhVa: ['Standard'],
      },
      attributes: {
        key: 'auth0|65806782706adf184397200b',
      },
    },
    'auth0|664b6b6d8c9808c33cc24d09': {
      roleAssignments: {
        org_Qshp7tYsxxAWwhVa: ['CustomerSuccess', 'Standard'],
      },
      attributes: {
        key: 'auth0|664b6b6d8c9808c33cc24d09',
      },
    },
  },
  tenants: {
    org_Qshp7tYsxxAWwhVa: {
      attributes: {},
    },
    org_Qshp7tYsxxAWwhVb: {
      attributes: {},
    },
  },
  roles: {
    Standard: {
      grants: {
        dashboard: ['read'],
        risk: ['read', 'write'],
      },
    },
    RiskManager: {
      grants: {
        risk: ['read', 'write', 'delete'],
      },
    },
  },
  relationships: {
    'rs_node:b3977083-5828-4d25-812b-09e772277bff': {
      'relation:rs_parent': {
        rs_node: ['c938bde6-460c-4b2a-af42-0d0f8c06a011'],
      },
      'relation:contributor': {
        user_group: ['5bdce249-61b4-40e0-8336-3d086e15de64'],
      },
    },
    'rs_node:c938bde6-460c-4b2a-af42-0d0f8c06a011': {
      'relation:owner': {
        owner_group: ['owner-123'],
      },
    },
    'user_group:5bdce249-61b4-40e0-8336-3d086e15de64': {},
  },
  resource_instances: {
    'rs_node:b3977083-5828-4d25-812b-09e772277bff': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: 'risk',
      },
    },
    'rs_node:c938bde6-460c-4b2a-af42-0d0f8c06a011': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: 'action',
      },
    },
    'user_group:5bdce249-61b4-40e0-8336-3d086e15de64': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: undefined,
      },
    },
    'contributor_group:contrib-123': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: undefined,
      },
    },
    'owner_group:owner-123': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: undefined,
      },
    },
    'rs_node:control-org_Qshp7tYsxxAWwhVa': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: 'control',
      },
    },
    'rs_node:control_group-org_Qshp7tYsxxAWwhVa': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: 'control_group',
      },
    },
    'rs_node:issue-org_Qshp7tYsxxAWwhVa': {
      tenant: 'org_Qshp7tYsxxAWwhVa',
      attributes: {
        ObjectType: 'issue',
      },
    },
    // Tenant B resources
    'rs_node:risk-b-1': {
      tenant: 'org_Qshp7tYsxxAWwhVb',
      attributes: {
        ObjectType: 'risk',
      },
    },
    'rs_node:control-org_Qshp7tYsxxAWwhVb': {
      tenant: 'org_Qshp7tYsxxAWwhVb',
      attributes: {
        ObjectType: 'control',
      },
    },
  },
  role_assignments: {
    'user:auth0|644151efc3a961d2784456d9': {
      'rs_node:b3977083-5828-4d25-812b-09e772277bff': [
        'Standard',
        'RiskManager',
      ],
      '__tenant:org_Qshp7tYsxxAWwhVa': ['Standard'],
      'rs_node:control-org_Qshp7tYsxxAWwhVa': ['Owner', 'Reader'],
      'rs_node:control_group-org_Qshp7tYsxxAWwhVa': ['Owner'],
      // Tenant B assignments for this cross-tenant user
      'rs_node:risk-b-1': ['Standard'],
      '__tenant:org_Qshp7tYsxxAWwhVb': ['ComplianceManager'],
      'rs_node:control-org_Qshp7tYsxxAWwhVb': ['Reader'],
    },
    'user:auth0|644152102c766a09dd585d2e': {
      'rs_node:c938bde6-460c-4b2a-af42-0d0f8c06a011': ['ComplianceManager'],
      '__tenant:org_Qshp7tYsxxAWwhVa': ['ComplianceManager'],
      'rs_node:control-org_Qshp7tYsxxAWwhVa': ['Reader'],
      'rs_node:issue-org_Qshp7tYsxxAWwhVa': ['Reader'],
      'rs_node:control_group-org_Qshp7tYsxxAWwhVa': ['Reader'],
    },
  },
};

export const ResourcesWithRelationshipTuples: Map<
  ResourceInstanceId,
  ResourceInstance
> = new Map<ResourceInstanceId, ResourceInstance>([
  [
    userGroupId('b3d6e665-2860-456c-a499-6764230d5bf1'),
    {
      InstanceType: 'user_group' as const,
      Id: 'b3d6e665-2860-456c-a499-6764230d5bf1',
      Relations: [],
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
    },
  ],
  [
    userGroupId('e37b905b-6aea-4842-8b28-36fe228ae902'),
    {
      InstanceType: 'user_group' as const,
      Id: 'e37b905b-6aea-4842-8b28-36fe228ae902',
      Relations: [],
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
    },
  ],
  [
    rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a1d30192-8100-46b1-a584-6db81b22f935',
      ObjectType: 'risk',
      Relations: [
        {
          Subject: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('d1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
      ObjectType: 'risk',
      Relations: [
        {
          Subject: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('c938bde6-460c-4b2a-af42-0d0f8c06a011'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'c938bde6-460c-4b2a-af42-0d0f8c06a011',
      ObjectType: 'risk',
      Relations: [
        {
          Subject: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('d1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('9f33de3f-3f3c-485e-a8d7-af16d1a72e94'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
      ObjectType: 'risk',
      Relations: [
        {
          Subject: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f7f'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
      ObjectType: 'risk',
      Relations: [
        {
          Subject: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f72'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b2781d16-4827-4d81-a9ba-9402e0c56f72',
      ObjectType: 'tag_type',
      Relations: [],
    },
  ],
  [
    rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f71'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b2781d16-4827-4d81-a9ba-9402e0c56f71',
      ObjectType: 'tag_type',
      Relations: [],
    },
  ],
  [
    rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f73'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b2781d16-4827-4d81-a9ba-9402e0c56f73',
      ObjectType: 'tag_type',
      Relations: [],
    },
  ],
  [
    rsNodeId('a2781d16-4827-4d81-a9ba-9402e0c56f73'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a2781d16-4827-4d81-a9ba-9402e0c56f73',
      ObjectType: 'department_type',
      Relations: [],
    },
  ],
  [
    rsNodeId('a2781d16-4827-4d81-a9ba-9402e0c56f71'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a2781d16-4827-4d81-a9ba-9402e0c56f71',
      ObjectType: 'department_type',
      Relations: [],
    },
  ],
  [
    rsNodeId('a2781d16-4827-4d81-a9ba-9402e0c56f72'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a2781d16-4827-4d81-a9ba-9402e0c56f72',
      ObjectType: 'department_type',
      Relations: [],
    },
  ],
  [
    rsNodeId('f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5',
      ObjectType: 'control',
      Relations: [
        {
          Subject: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('f1d30192-8100-46b1-a584-6db81b22f935'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f1d30192-8100-46b1-a584-6db81b22f935',
      ObjectType: 'control',
      Relations: [
        {
          Subject: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
      ObjectType: 'control',
      Relations: [
        {
          Subject: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
      ObjectType: 'control',
      Relations: [
        {
          Subject: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('f938bde6-460c-4b2a-af42-0d0f8c06a011'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f938bde6-460c-4b2a-af42-0d0f8c06a011',
      ObjectType: 'control',
      Relations: [
        {
          Subject: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('d1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('ff33de3f-3f3c-485e-a8d7-af16d1a72e94'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
      ObjectType: 'control',
      Relations: [
        {
          Subject: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('2cf1c062-d5d0-4ea4-bde4-5e64c35e1bb2'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '2cf1c062-d5d0-4ea4-bde4-5e64c35e1bb2',
      ObjectType: 'test_result',
      Relations: [
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('289238a7-a26f-40b9-9994-31c687e785d7'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '289238a7-a26f-40b9-9994-31c687e785d7',
      ObjectType: 'test_result',
      Relations: [
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('a9b62138-c869-44cc-85e5-0c06851e3522'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a9b62138-c869-44cc-85e5-0c06851e3522',
      ObjectType: 'test_result',
      Relations: [
        {
          Subject: rsNodeId('ff33de3f-3f3c-485e-a8d7-af16d1a72e94'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('2255de57-e314-4fdb-ab69-e457c757d437'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '2255de57-e314-4fdb-ab69-e457c757d437',
      ObjectType: 'test_result',
      Relations: [
        {
          Subject: rsNodeId('ff33de3f-3f3c-485e-a8d7-af16d1a72e94'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('b3977083-5828-4d25-812b-09e772277bff'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b3977083-5828-4d25-812b-09e772277bff',
      ObjectType: 'acceptance',
      Relations: [
        {
          Subject: rsNodeId('d1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('1bc4783f-4cd0-4d96-ba4a-6a7099a132d7'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '1bc4783f-4cd0-4d96-ba4a-6a7099a132d7',
      ObjectType: 'acceptance',
      Relations: [
        {
          Subject: rsNodeId('9f33de3f-3f3c-485e-a8d7-af16d1a72e94'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('3f61872d-2a71-44b1-b4ba-717ad6c5018c'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '3f61872d-2a71-44b1-b4ba-717ad6c5018c',
      ObjectType: 'acceptance',
      Relations: [
        {
          Subject: rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('c8a45609-44d1-4051-906a-3616f493d29b'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'c8a45609-44d1-4051-906a-3616f493d29b',
      ObjectType: 'acceptance',
      Relations: [
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('146eea61-5ddf-4ac6-b6f7-8981afa168a8'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '146eea61-5ddf-4ac6-b6f7-8981afa168a8',
      ObjectType: 'issue',
      Relations: [
        {
          Subject: rsNodeId('issue-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('2d1a8512-fa2e-4f8c-9c07-8b89e4d074a4'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '2d1a8512-fa2e-4f8c-9c07-8b89e4d074a4',
      ObjectType: 'issue',
      Relations: [
        {
          Subject: rsNodeId('issue-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
      ObjectType: 'issue',
      Relations: [
        {
          Subject: rsNodeId('issue-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44',
      ObjectType: 'action',
      Relations: [
        {
          Subject: rsNodeId('action-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('92884517-4731-4446-abb8-b0cbed0e9842'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '92884517-4731-4446-abb8-b0cbed0e9842',
      ObjectType: 'action',
      Relations: [
        {
          Subject: rsNodeId('action-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('12fffadd-8a01-4cb7-ac2b-888d1aa5ee54'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '12fffadd-8a01-4cb7-ac2b-888d1aa5ee54',
      ObjectType: 'action',
      Relations: [
        {
          Subject: rsNodeId('action-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('5fb12cda-cfda-4246-a8f9-3debdfbb103f'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '5fb12cda-cfda-4246-a8f9-3debdfbb103f',
      ObjectType: 'action_update',
      Relations: [
        {
          Subject: rsNodeId('92884517-4731-4446-abb8-b0cbed0e9842'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('71231531-f14b-43b2-b899-f734fdc70d01'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '71231531-f14b-43b2-b899-f734fdc70d01',
      ObjectType: 'action_update',
      Relations: [
        {
          Subject: rsNodeId('92884517-4731-4446-abb8-b0cbed0e9842'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('e8a0a790-209c-490e-9d21-a9045528d766'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'e8a0a790-209c-490e-9d21-a9045528d766',
      ObjectType: 'action_update',
      Relations: [
        {
          Subject: rsNodeId('92884517-4731-4446-abb8-b0cbed0e9842'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('e0b45e68-2522-48c8-bf6d-c46180c2617c'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'e0b45e68-2522-48c8-bf6d-c46180c2617c',
      ObjectType: 'action_update',
      Relations: [
        {
          Subject: rsNodeId('92884517-4731-4446-abb8-b0cbed0e9842'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('955ce31b-9a62-4721-acc2-57e7105db50c'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '955ce31b-9a62-4721-acc2-57e7105db50c',
      ObjectType: 'issue_update',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('cdc09f4c-b0b0-4849-a78b-b16c6ccc68f0'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'cdc09f4c-b0b0-4849-a78b-b16c6ccc68f0',
      ObjectType: 'issue_update',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('ca8ddd35-ded7-439c-a7ed-6a7a506dd277'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'ca8ddd35-ded7-439c-a7ed-6a7a506dd277',
      ObjectType: 'issue_update',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('6bbbd7ea-f761-4245-9847-ab43d9d755e1'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '6bbbd7ea-f761-4245-9847-ab43d9d755e1',
      ObjectType: 'issue_update',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('7e34148d-c579-4799-baed-830c1c82f599'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '7e34148d-c579-4799-baed-830c1c82f599',
      ObjectType: 'issue_assessment',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('a803ea8d-fa58-4757-b6c8-d5e40855251c'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a803ea8d-fa58-4757-b6c8-d5e40855251c',
      ObjectType: 'issue_assessment',
      Relations: [
        {
          Subject: rsNodeId('146eea61-5ddf-4ac6-b6f7-8981afa168a8'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('2bca04f7-1084-4e7b-bd53-06022037ec06'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '2bca04f7-1084-4e7b-bd53-06022037ec06',
      ObjectType: 'cause',
      Relations: [
        {
          Subject: rsNodeId('146eea61-5ddf-4ac6-b6f7-8981afa168a8'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('bc979055-e717-453b-b2a9-53ee31cb89a3'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'bc979055-e717-453b-b2a9-53ee31cb89a3',
      ObjectType: 'cause',
      Relations: [
        {
          Subject: rsNodeId('146eea61-5ddf-4ac6-b6f7-8981afa168a8'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('83343ea9-354a-4a9b-8b8c-6485199bd915'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '83343ea9-354a-4a9b-8b8c-6485199bd915',
      ObjectType: 'cause',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('9edc0424-413b-459e-805e-69e42c4b9883'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '9edc0424-413b-459e-805e-69e42c4b9883',
      ObjectType: 'cause',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('7d601b85-4e1d-4d61-a150-ceaf261096ea'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '7d601b85-4e1d-4d61-a150-ceaf261096ea',
      ObjectType: 'consequence',
      Relations: [
        {
          Subject: rsNodeId('146eea61-5ddf-4ac6-b6f7-8981afa168a8'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('4277eb4e-560f-4364-82df-aabc814f2c9d'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '4277eb4e-560f-4364-82df-aabc814f2c9d',
      ObjectType: 'consequence',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('aec54109-94a1-4105-9ffa-df1765a0c23e'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'aec54109-94a1-4105-9ffa-df1765a0c23e',
      ObjectType: 'consequence',
      Relations: [
        {
          Subject: rsNodeId('146eea61-5ddf-4ac6-b6f7-8981afa168a8'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('6ab8b783-a9e2-44bb-9d50-27595eb031d5'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '6ab8b783-a9e2-44bb-9d50-27595eb031d5',
      ObjectType: 'consequence',
      Relations: [
        {
          Subject: rsNodeId('75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('71c1e1c6-186a-4660-9fb3-1ba1cfa12593'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '71c1e1c6-186a-4660-9fb3-1ba1cfa12593',
      ObjectType: 'control_group',
      Relations: [
        {
          Subject: rsNodeId('control_group-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('190b0c12-d127-4e89-b5db-ff57195273a6'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '190b0c12-d127-4e89-b5db-ff57195273a6',
      ObjectType: 'control_group',
      Relations: [
        {
          Subject: rsNodeId('control_group-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('42bbc0fc-f949-4c40-a2db-86abfdc69d2b'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '42bbc0fc-f949-4c40-a2db-86abfdc69d2b',
      ObjectType: 'control_group',
      Relations: [
        {
          Subject: rsNodeId('control_group-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('cb030e81-9941-44e3-af98-4599e85201e0'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'cb030e81-9941-44e3-af98-4599e85201e0',
      ObjectType: 'obligation',
      Relations: [
        {
          Subject: rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('68873565-c665-4e4d-b086-763c59da1e68'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('89571185-0342-4614-9f84-ef775cca29bb'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '89571185-0342-4614-9f84-ef775cca29bb',
      ObjectType: 'obligation',
      Relations: [
        {
          Subject: rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('bc02463e-ab36-4224-bad9-bda519df42b0'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'bc02463e-ab36-4224-bad9-bda519df42b0',
      ObjectType: 'obligation',
      Relations: [
        {
          Subject: rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('cb030e81-9941-44e3-af98-4599e85201e0'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('68873565-c665-4e4d-b086-763c59da1e68'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '68873565-c665-4e4d-b086-763c59da1e68',
      ObjectType: 'obligation',
      Relations: [
        {
          Subject: rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('c177afed-38a3-469e-ba10-0b0754d71090'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'c177afed-38a3-469e-ba10-0b0754d71090',
      ObjectType: 'obligation_impact',
      Relations: [
        {
          Subject: rsNodeId('68873565-c665-4e4d-b086-763c59da1e68'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('b8694ef8-2f4c-4b41-9c77-60fb44163736'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b8694ef8-2f4c-4b41-9c77-60fb44163736',
      ObjectType: 'indicator',
      Relations: [
        {
          Subject: rsNodeId('indicator-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('b557bd57-0a17-4981-8559-9809296b1975'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b557bd57-0a17-4981-8559-9809296b1975',
      ObjectType: 'indicator',
      Relations: [
        {
          Subject: rsNodeId('indicator-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('032f6146-8dd7-4f07-b8fd-06156eeaed62'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '032f6146-8dd7-4f07-b8fd-06156eeaed62',
      ObjectType: 'indicator',
      Relations: [
        {
          Subject: rsNodeId('indicator-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('8f00f17f-95b8-4e58-ab18-d0f2aa756b3d'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '8f00f17f-95b8-4e58-ab18-d0f2aa756b3d',
      ObjectType: 'indicator_result',
      Relations: [
        {
          Subject: rsNodeId('032f6146-8dd7-4f07-b8fd-06156eeaed62'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('651a29fd-019f-44b3-9bdc-bc820a9f1cab'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '651a29fd-019f-44b3-9bdc-bc820a9f1cab',
      ObjectType: 'document',
      Relations: [
        {
          Subject: rsNodeId('document-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('0d3a9abc-dd17-4036-ab52-47d13db75128'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '0d3a9abc-dd17-4036-ab52-47d13db75128',
      ObjectType: 'document',
      Relations: [
        {
          Subject: rsNodeId('document-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('1fd6d8ed-c8b6-4d31-b07d-14c96e5f163f'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '1fd6d8ed-c8b6-4d31-b07d-14c96e5f163f',
      ObjectType: 'document',
      Relations: [
        {
          Subject: rsNodeId('document-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
      ObjectType: 'assessment',
      Relations: [
        {
          Subject: rsNodeId('assessment-org_Qshp7tYsxxAWwhVa'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('73bbbd32-824e-4209-9851-66a126eae39d'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '73bbbd32-824e-4209-9851-66a126eae39d',
      ObjectType: 'document_assessment_result',
      Relations: [
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('0d3a9abc-dd17-4036-ab52-47d13db75128'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
      ObjectType: 'obligation_assessment_result',
      Relations: [
        {
          Subject: rsNodeId('68873565-c665-4e4d-b086-763c59da1e68'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('1dcf43c7-62d8-4aff-93aa-db66c62282a4'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '1dcf43c7-62d8-4aff-93aa-db66c62282a4',
      ObjectType: 'risk_assessment_result',
      Relations: [
        {
          Subject: rsNodeId('5735b222-82cc-4548-98ab-12d0d8e9feb3'),
          Relation: 'rs_parent',
        },
        {
          Subject: rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('aaa8eb87-b197-40bd-8b88-778965b52865'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'aaa8eb87-b197-40bd-8b88-778965b52865',
      ObjectType: 'impact',
      Relations: [],
    },
  ],
  [
    rsNodeId('774357dd-0733-41a6-a5f1-59f59f96553b'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '774357dd-0733-41a6-a5f1-59f59f96553b',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('aaa8eb87-b197-40bd-8b88-778965b52865'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('2667413a-3b10-403a-88ed-01f0d15e07dc'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '2667413a-3b10-403a-88ed-01f0d15e07dc',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('aaa8eb87-b197-40bd-8b88-778965b52865'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('c2beb072-0a4b-48f4-8997-6b9193cf9dd3'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'c2beb072-0a4b-48f4-8997-6b9193cf9dd3',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('aaa8eb87-b197-40bd-8b88-778965b52865'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('1a5e4b69-9661-4559-98be-e599406aeb16'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '1a5e4b69-9661-4559-98be-e599406aeb16',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('982fa46d-d099-435a-81d0-6f9ba57f8462'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '982fa46d-d099-435a-81d0-6f9ba57f8462',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('50cc675c-5d74-4612-b7cb-0cfe40951386'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '50cc675c-5d74-4612-b7cb-0cfe40951386',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('086529bb-0ac1-4c37-b299-185e917f26de'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '086529bb-0ac1-4c37-b299-185e917f26de',
      ObjectType: 'appetite',
      Relations: [
        {
          Subject: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('23bd03e9-da11-4370-a2f5-e9b4a955b637'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '23bd03e9-da11-4370-a2f5-e9b4a955b637',
      ObjectType: 'impact_rating',
      Relations: [
        {
          Subject: rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f7f'),
          Relation: 'rs_parent',
        },
      ],
    },
  ],
  [
    rsNodeId('f435fbb9-63c6-40fc-9f9f-8d9f6ffb50e3'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f435fbb9-63c6-40fc-9f9f-8d9f6ffb50e3',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('731fba9b-0f5d-4975-bcd2-110dcf6e3051'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '731fba9b-0f5d-4975-bcd2-110dcf6e3051',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('c8e39d7b-be28-41ba-8981-ffa7fa787df2'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'c8e39d7b-be28-41ba-8981-ffa7fa787df2',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('355246b2-3bff-4387-bcd6-656a8450e8eb'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '355246b2-3bff-4387-bcd6-656a8450e8eb',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('ce5db7e8-321b-4f80-8998-9aa207e802f1'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'ce5db7e8-321b-4f80-8998-9aa207e802f1',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('471b0f8b-3d70-41d8-845e-44af62dd1be8'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '471b0f8b-3d70-41d8-845e-44af62dd1be8',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('f37292ca-dd89-4efb-977a-53fd6040e3a7'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f37292ca-dd89-4efb-977a-53fd6040e3a7',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('c6a6ca23-6f2c-4832-a984-9454d12e7890'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'c6a6ca23-6f2c-4832-a984-9454d12e7890',
      ObjectType: 'object',
      Relations: [],
    },
  ],
  [
    rsNodeId('8c4ac1ce-4d42-4fc7-ae97-8e89827340ff'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '8c4ac1ce-4d42-4fc7-ae97-8e89827340ff',
      ObjectType: 'enterprise_risk',
      Relations: [],
    },
  ],
  [
    rsNodeId('2ba2a962-b8a8-47ac-882a-4c7824008f9b'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: '2ba2a962-b8a8-47ac-882a-4c7824008f9b',
      ObjectType: 'enterprise_risk',
      Relations: [],
    },
  ],
  [
    rsNodeId('b1a6c853-a649-4755-b868-f2dd0f73fcbe'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'b1a6c853-a649-4755-b868-f2dd0f73fcbe',
      ObjectType: 'enterprise_risk',
      Relations: [],
    },
  ],
  [
    rsNodeId('f02b1467-1192-43c1-8c95-7fd75a2d301c'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'f02b1467-1192-43c1-8c95-7fd75a2d301c',
      ObjectType: 'enterprise_risk',
      Relations: [],
    },
  ],
  [
    rsNodeId('a926620f-7de7-419c-87c1-80bd14e322ce'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'a926620f-7de7-419c-87c1-80bd14e322ce',
      ObjectType: 'enterprise_risk',
      Relations: [],
    },
  ],
  [
    rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'risk-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'risk',
      Relations: [],
    },
  ],
  [
    rsNodeId('action-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'action-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'action',
      Relations: [],
    },
  ],
  [
    rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'control-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'control',
      Relations: [],
    },
  ],
  [
    rsNodeId('control_group-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'control_group-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'control_group',
      Relations: [],
    },
  ],
  [
    rsNodeId('issue-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'issue-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'issue',
      Relations: [],
    },
  ],
  [
    rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'obligation-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'obligation',
      Relations: [],
    },
  ],
  [
    rsNodeId('obligation_change-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'obligation_change-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'obligation_change',
      Relations: [],
    },
  ],
  [
    rsNodeId('document-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'document-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'document',
      Relations: [],
    },
  ],
  [
    rsNodeId('third_party-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'third_party-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'third_party',
      Relations: [],
    },
  ],
  [
    rsNodeId('assessment-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'assessment-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'assessment',
      Relations: [],
    },
  ],
  [
    rsNodeId('indicator-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'indicator-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'indicator',
      Relations: [],
    },
  ],
  [
    rsNodeId('internal_audit_entity-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'internal_audit_entity-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'internal_audit_entity',
      Relations: [],
    },
  ],
  [
    rsNodeId('internal_audit_report-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'internal_audit_report-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'internal_audit_report',
      Relations: [],
    },
  ],
  [
    rsNodeId('custom_datasource-org_Qshp7tYsxxAWwhVa'),
    {
      InstanceType: 'rs_node' as const,
      OrgKey: 'org_Qshp7tYsxxAWwhVb',
      Id: 'custom_datasource-org_Qshp7tYsxxAWwhVa',
      ObjectType: 'custom_datasource',
      Relations: [],
    },
  ],
]);

export const Users: PermitTenant['Users'] = [
  {
    Id: 'auth0|644151efc3a961d2784456d9',
    Roles: [
      'Standard',
      'RiskManager',
      'PolicyManager',
      'ComplianceManager',
      'ThirdPartyManager',
      'IndicatorManager',
      'ControlManager',
      'IssueManager',
      'ActionManager',
      'AssessmentManager',
      'InternalAuditManager',
      'CustomDataSourceManager',
      'SettingsManager',
    ],
    RoleAssignments: [
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('issue-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('action-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('assessment-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId(
          'internal_audit_entity-org_Qshp7tYsxxAWwhVa'
        ),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId(
          'internal_audit_report-org_Qshp7tYsxxAWwhVa'
        ),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('custom_datasource-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('651a29fd-019f-44b3-9bdc-bc820a9f1cab'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('1fd6d8ed-c8b6-4d31-b07d-14c96e5f163f'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('b2781d16-4827-4d81-a9ba-9402e0c56f7f'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('9f33de3f-3f3c-485e-a8d7-af16d1a72e94'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('a1d30192-8100-46b1-a584-6db81b22f935'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('d1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('c938bde6-460c-4b2a-af42-0d0f8c06a011'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('f2781d16-4827-4d81-a9ba-9402e0c56f7f'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('ff33de3f-3f3c-485e-a8d7-af16d1a72e94'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('f938bde6-460c-4b2a-af42-0d0f8c06a011'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('92884517-4731-4446-abb8-b0cbed0e9842'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('12fffadd-8a01-4cb7-ac2b-888d1aa5ee54'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('68873565-c665-4e4d-b086-763c59da1e68'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('cb030e81-9941-44e3-af98-4599e85201e0'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('bc02463e-ab36-4224-bad9-bda519df42b0'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('89571185-0342-4614-9f84-ef775cca29bb'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('b8694ef8-2f4c-4b41-9c77-60fb44163736'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('b557bd57-0a17-4981-8559-9809296b1975'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('032f6146-8dd7-4f07-b8fd-06156eeaed62'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('0d3a9abc-dd17-4036-ab52-47d13db75128'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('document-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('third_party-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('indicator-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Owner'],
        ResourceInstanceId: rsNodeId('control_group-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['member'],
        ResourceInstanceId: userGroupId('e37b905b-6aea-4842-8b28-36fe228ae902'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['member'],
        ResourceInstanceId: userGroupId('b3d6e665-2860-456c-a499-6764230d5bf1'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
    ],
  },
  {
    Id: 'auth0|644152102c766a09dd585d2e',
    Roles: ['Standard'],
    RoleAssignments: [],
  },
  {
    Id: 'auth0|6580670a706adf1843972000',
    Roles: ['Standard'],
    RoleAssignments: [],
  },
  {
    Id: 'auth0|65806782706adf184397200b',
    Roles: ['Standard'],
    RoleAssignments: [],
  },
  {
    Id: 'auth0|664b6b6d8c9808c33cc24d09',
    Roles: ['Standard', 'CustomerSuccess'],
    RoleAssignments: [],
  },
  {
    Id: 'auth0|6658ab3ae575fc51158bb0eb',
    Roles: [
      'Standard',
      'RiskViewer',
      'PolicyViewer',
      'ComplianceViewer',
      'ThirdPartyViewer',
      'IndicatorViewer',
      'ControlViewer',
      'IssueViewer',
      'ActionViewer',
      'AssessmentViewer',
      'InternalAuditViewer',
      'CustomDataSourceViewer',
    ],
    RoleAssignments: [
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('risk-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('document-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('obligation-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('third_party-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('indicator-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('control-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('control_group-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('issue-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('action-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('assessment-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId(
          'internal_audit_entity-org_Qshp7tYsxxAWwhVa'
        ),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId(
          'internal_audit_report-org_Qshp7tYsxxAWwhVa'
        ),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
      {
        Roles: ['Reader'],
        ResourceInstanceId: rsNodeId('custom_datasource-org_Qshp7tYsxxAWwhVa'),
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
      },
    ],
  },
  {
    Id: 'auth0|66a9ff41a830680647dc6553',
    Roles: ['Standard'],
    RoleAssignments: [],
  },
  {
    Id: 'auth0|6707ec212c4ec21f3de97b44',
    Roles: ['Standard'],
    RoleAssignments: [],
  },
  {
    Id: 'auth0|67a21d379b21880e484efd1e',
    Roles: ['Standard'],
    RoleAssignments: [],
  },
];
