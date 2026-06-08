import axios from 'axios';
import { when } from 'jest-when';
import { beforeEach, expect, test, vi } from 'vitest';

import type { API, Event } from '../../types/post-login';
import {
  type AuthUser,
  GetUserByIdGQL,
  onExecutePostLogin,
  UpdateUserGQL,
} from './code';

vi.mock('axios');

const axiosMock = vi.mocked(axios.post);

const defaultEvent: Event = {
  tenant: {
    id: 'dev-t8t3iey3b54zkh7i',
  },
  authorization: {
    roles: ['InternalAudit'],
  },
  user: {
    user_id: 'user-123',
  },
  client: { client_id: 'client123', name: 'clientName', metadata: {} },
  connection: {
    id: 'con234',
    name: 'conName',
    strategy: 'strat124',
  },
  request: {
    body: {},
    geoip: {},
    ip: '',
    method: '',
    query: {},
  },
  stats: { logins_count: 0 },
  secrets: {
    IDENTITY_APP_BASEURL: '',
    AUTH0_PAYLOAD_SECRET: '',
    HASURA_TENANT_API_ENDPOINT: 'https://valid-url.com',
    HASURA_ADMIN_SECRET: '',
    DEV_TENANT_ID: 'dev-t8t3iey3b54zkh7i',
  },
};

const thirdPartyEvent: Event = {
  tenant: {
    id: 'dev-t8t3iey3b54zkh7i',
  },
  authorization: {
    roles: [],
  },
  user: {
    user_id: 'user-123',
  },
  client: { client_id: 'client123', name: 'clientName', metadata: {} },
  connection: {
    id: 'con_hpO7Mo8YbgEiLCIg',
    name: 'Username-Password-ThirdParty',
    strategy: 'strat124',
  },
  request: {
    body: {},
    geoip: {},
    ip: '',
    method: '',
    query: {},
  },
  stats: { logins_count: 0 },
  secrets: {
    IDENTITY_APP_BASEURL: '',
    AUTH0_PAYLOAD_SECRET: '',
    HASURA_TENANT_API_ENDPOINT: '',
    HASURA_ADMIN_SECRET: '',
    DEV_TENANT_ID: 'dev-t8t3iey3b54zkh7i',
  },
};

let api: API;

beforeEach(() => {
  api = {
    authentication: {
      challengeWith: vi.fn(),
    },
    idToken: {
      setCustomClaim: vi.fn(),
    },
    accessToken: {
      setCustomClaim: vi.fn(),
    },
    terms_and_conditions_accepted: true,
    access: { deny: vi.fn() },
    multifactor: { enable: vi.fn() },
    user: { setUserMetadata: vi.fn(), setAppMetadata: vi.fn() },
    redirect: {
      sendUserTo: vi.fn(),
      encodeToken: vi.fn(),
      validateToken: vi.fn(),
    },
  };
});

test("sets role to 'ThirdPartyRespondent' when Username-Password-ThirdParty connection name is in the event", async () => {
  const event: Event = {
    ...thirdPartyEvent,
  };

  await onExecutePostLogin(event, api);

  expect(api.accessToken.setCustomClaim).toHaveBeenCalledWith(
    'https://hasura.io/jwt/claims',
    expect.objectContaining({
      'x-hasura-default-role': 'ThirdPartyRespondent',
    })
  );
});

test("sets role to 'InternalAudit' when InternalAudit role is in the event", async () => {
  const event: Event = {
    ...defaultEvent,
    authorization: {
      roles: ['InternalAudit'],
    },
  };

  await onExecutePostLogin(event, api);

  expect(api.accessToken.setCustomClaim).toHaveBeenCalledWith(
    'https://hasura.io/jwt/claims',
    expect.objectContaining({
      'x-hasura-default-role': 'InternalAudit',
    })
  );
});

test("sets role to 'public' when 'nopublic' feature flag NOT set", async () => {
  const event: Event = {
    ...defaultEvent,
    authorization: {
      roles: [],
    },
  };

  await onExecutePostLogin(event, api);

  expect(api.accessToken.setCustomClaim).toHaveBeenCalledWith(
    'https://hasura.io/jwt/claims',
    expect.objectContaining({
      'x-hasura-default-role': 'Public',
    })
  );
});

test.each([{ isCustomerSupport: true }, { isCustomerSupport: false }])(
  "sets is-customer-support claim to '$isCustomerSupport' when 'IsCustomerSupport' $isCustomerSupport in db",
  async ({ isCustomerSupport }) => {
    const auth_user: AuthUser = {
      Id: '124',
      FirstName: 'Test',
      LastName: 'User',
      UserName: 'testuser',
      Email: 'test@example.com',
      AuthUser_Id: 'auth0|123',
      External_Id: 'ext-123',
      DisplayName: 'Test User',
      organisationusers: [],
      IsCustomerSupport: isCustomerSupport,
    };
    when(axiosMock)
      .calledWith(
        expect.anything(),
        { query: GetUserByIdGQL, variables: expect.anything() },
        expect.anything()
      )
      .mockResolvedValue({
        data: { data: { auth_user: [auth_user] } },
      });

    when(axiosMock)
      .calledWith(
        expect.anything(),
        { query: UpdateUserGQL, variables: expect.anything() },
        expect.anything()
      )
      .mockResolvedValue({
        data: { data: { update_auth_user_by_pk: auth_user } },
      });

    const event: Event = {
      ...defaultEvent,
      tenant: { id: 'live-account' },
      authorization: {
        roles: [],
      },
    };

    await onExecutePostLogin(event, api);

    expect(api.accessToken.setCustomClaim).toHaveBeenCalledWith(
      'https://hasura.io/jwt/claims',
      expect.objectContaining({
        'x-hasura-is-customer-support': String(isCustomerSupport),
      })
    );
  }
);

test("sets role to 'NoAccess' when 'nopublic' feature flag is set and no roles", async () => {
  const event: Event = {
    ...defaultEvent,
    authorization: {
      roles: [],
    },
    organization: {
      display_name: '',
      id: '',
      name: '',
      metadata: {
        features: 'a,nopublic,b',
      },
    },
  };

  await onExecutePostLogin(event, api);

  expect(api.accessToken.setCustomClaim).toHaveBeenCalledWith(
    'https://hasura.io/jwt/claims',
    expect.objectContaining({
      'x-hasura-default-role': 'NoAccess',
    })
  );
});

test("sets role to 'NoAccess' when 'nopublic' feature flag is set and only have Public role", async () => {
  const event: Event = {
    ...defaultEvent,
    authorization: {
      roles: ['Public'],
    },
    user: {
      user_id: 'user-123',
    },
    organization: {
      display_name: '',
      id: '',
      name: '',
      metadata: {
        features: 'a,nopublic,b',
      },
    },
  };

  await onExecutePostLogin(event, api);

  expect(api.accessToken.setCustomClaim).toHaveBeenCalledWith(
    'https://hasura.io/jwt/claims',
    expect.objectContaining({
      'x-hasura-default-role': 'NoAccess',
    })
  );
});

test('sets organization_idle_timeout claim from organization metadata', async () => {
  const event: Event = {
    ...defaultEvent,
    organization: {
      display_name: 'Test Org',
      id: 'org123',
      name: 'test-org',
      metadata: {
        ui_idle_timeout: '3600',
      },
    },
  };

  await onExecutePostLogin(event, api);

  expect(api.idToken.setCustomClaim).toHaveBeenCalledWith(
    'claims_organization_idle_timeout',
    '3600'
  );
});

test('sets organization_idle_timeout claim to default when not in organization metadata', async () => {
  const event: Event = {
    ...defaultEvent,
    organization: {
      display_name: 'Test Org',
      id: 'org123',
      name: 'test-org',
      metadata: {},
    },
  };

  await onExecutePostLogin(event, api);

  expect(api.idToken.setCustomClaim).toHaveBeenCalledWith(
    'claims_organization_idle_timeout',
    '14400'
  );
});
