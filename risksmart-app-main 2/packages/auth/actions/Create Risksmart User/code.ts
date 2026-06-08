import axios from 'axios';

import type {
  AddOrganisationUserMutation,
  AddOrganisationUserMutationVariables,
  CreateUserMutation,
  CreateUserMutationVariables,
  GetOrganisationQuery,
  GetOrganisationQueryVariables,
  GetOrgUserByEmailQuery,
  GetOrgUserByEmailQueryVariables,
  GetRiskSmartUserByAuthUserIdQuery,
  GetRiskSmartUserByAuthUserIdQueryVariables,
  GetUserByIdQuery,
  GetUserByIdQueryVariables,
  InsertOrganisationMutation,
  InsertOrganisationMutationVariables,
  InsertUserActivityAuditMutation,
  InsertUserActivityAuditMutationVariables,
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '../../generated/graphql';
import type { API, Event } from '../../types/post-login';

const riskSmartUserIdField = 'risksmart-user-id';
const auth0SystemId = 'Auth0';

export const GetUserByIdGQL = /* GraphQL */ `
  query GetUserById($userId: String!, $orgKey: String!) {
    auth_user(where: { Id: { _eq: $userId } }) {
      Id
      FirstName
      LastName
      UserName
      Email
      AuthUser_Id
      External_Id
      DisplayName
      organisationusers(where: { OrgKey: { _eq: $orgKey } }) {
        RoleKey
        External_Id
      }
      IsCustomerSupport
    }
  }
`;

export const UpdateUserGQL = /* GraphQL */ `
  mutation UpdateUser(
    $UserId: String!
    $OrgKey: String!
    $AuthClient_Id: String
    $AuthClientName: String
    $AuthTenant: String
    $AuthConnection_Id: String
    $AuthConnection: String
    $AuthUser_Id: String
    $Email: String
    $RoleKey: String
    $ModifiedByUser: String
  ) {
    update_auth_user_by_pk(
      pk_columns: { Id: $UserId }
      _set: {
        AuthClient_Id: $AuthClient_Id
        AuthClientName: $AuthClientName
        AuthTenant: $AuthTenant
        AuthConnection_Id: $AuthConnection_Id
        AuthConnection: $AuthConnection
        AuthUser_Id: $AuthUser_Id
        LastSeen: "now()"
        Email: $Email
        ModifiedByUser: $ModifiedByUser
        RoleKey: $RoleKey
        ModifiedAtTimestamp: "now()"
      }
    ) {
      Id
      FirstName
      LastName
      UserName
      Email
      AuthUser_Id
      External_Id
      DisplayName
      RoleKey
      organisationusers(where: { OrgKey: { _eq: $OrgKey } }) {
        RoleKey
      }
      IsCustomerSupport
    }
  }
`;

export type AuthUser = GetUserByIdQuery['auth_user'][number];

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {API} api - Interface whose methods can be used to change the behavior of the login.
 */
export const onExecutePostLogin = async (event: Event, api: API) => {
  if (event.client.name === 'RiskSmart Community') {
    return;
  }

  try {
    await upsertRisksmartOrganization(event);
    const existingUser = await getExistingRiskSmartUser(event);
    const role = getUserRole(event, existingUser);

    const user = existingUser
      ? await updateRiskSmartUser(event, existingUser, role)
      : await createRiskSmartUser(event, role);

    await updateAuth0User(event, api, user);
    await addUserToRisksmartOrg(event, user, role);
    await addUserActivityLoginLog(event, user);
    setClaims(event, api, user, role);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
   Update auth0 user with risksmart user id
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {API} api - Interface whose methods can be used to change the behavior of the login.
 * @param user - The user to update
 */
async function updateAuth0User(event: Event, api: API, user: AuthUser | null) {
  if (isDev(event)) {
    return;
  }
  if (!user) {
    throw new Error('Cannot update null user');
  }
  api.user.setAppMetadata(riskSmartUserIdField, user.Id);
}

/**
    Create or update risksmart organization

 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
async function upsertRisksmartOrganization(event: Event) {
  if (isDev(event) || !event.organization) {
    return;
  }
  const id = event.organization.id;
  const name = event.organization.display_name || event.organization.name;
  const tenant = event.tenant.id;
  const meta = event.organization.metadata;

  const org = await getOrganisation(event, id);
  if (!org) {
    console.log('creating organization');
    await createOrganization(event, id, name, tenant, meta);

    return;
  }

  if (
    org.Name !== name ||
    org.AuthTenant !== tenant ||
    JSON.stringify(org.Meta) !== JSON.stringify(meta)
  ) {
    console.log('updating organization');
    await updateOrganization(event, id, name, tenant, meta);
  }
}

async function getOrganisation(event: Event, orgKey: string) {
  const query = /* GraphQL */ `
    query GetOrganisation($orgKey: String!) {
      auth_organisation_by_pk(OrgKey: $orgKey) {
        OrgKey
        Name
        AuthTenant
        Meta
      }
    }
  `;

  const variables = { orgKey };
  const result = await executeGraphql<
    GetOrganisationQuery,
    GetOrganisationQueryVariables
  >(event, query, variables);

  return result.auth_organisation_by_pk;
}

async function createOrganization(
  event: Event,
  orgKey: string,
  name: string,
  tenant: string,
  meta: Record<string, string>
) {
  const mutation = /* GraphQL */ `
    mutation insertOrganisation(
      $orgKey: String!
      $name: String
      $tenant: String
      $meta: json
      $createdByUser: String
    ) {
      insert_auth_organisation_one(
        object: {
          OrgKey: $orgKey
          Name: $name
          AuthTenant: $tenant
          Meta: $meta
          CreatedByUser: $createdByUser
        }
      ) {
        OrgKey
      }
    }
  `;
  const variables = {
    orgKey,
    name,
    tenant,
    meta,
    createdByUser: auth0SystemId,
  };
  await executeGraphql<
    InsertOrganisationMutation,
    InsertOrganisationMutationVariables
  >(event, mutation, variables);
}

async function updateOrganization(
  event: Event,
  orgKey: string,
  name: string,
  tenant: string,
  meta: Record<string, string>
) {
  const mutation = /* GraphQL */ `
    mutation updateOrganization(
      $orgKey: String!
      $name: String
      $tenant: String
      $meta: json
      $modifiedByUser: String
    ) {
      update_auth_organisation_by_pk(
        pk_columns: { OrgKey: $orgKey }
        _set: {
          Name: $name
          AuthTenant: $tenant
          Meta: $meta
          ModifiedByUser: $modifiedByUser
          ModifiedAtTimestamp: "now()"
        }
      ) {
        OrgKey
      }
    }
  `;
  const variables = {
    orgKey,
    name,
    tenant,
    meta,
    modifiedByUser: auth0SystemId,
  };
  await executeGraphql<
    UpdateOrganizationMutation,
    UpdateOrganizationMutationVariables
  >(event, mutation, variables);
}

/**
    Get user role from hasura or auth0

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param user - The user to get the role for
 */
function getUserRole(event: Event, user: AuthUser | null) {
  console.log('Getting user role');

  const userOrg = user?.organisationusers?.length
    ? user.organisationusers[0]
    : null;
  if (userOrg && userOrg.RoleKey) {
    console.log('Applying role from hasura for user', userOrg.RoleKey);

    return userOrg.RoleKey;
  }

  const assignedRoles = event.authorization?.roles;
  const auth0Role = chooseRole(event, assignedRoles);
  console.log('Applying role from auth0', auth0Role);

  return auth0Role;
}

/**
    Get existing RiskSmart user

 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
async function getExistingRiskSmartUser(
  event: Event
): Promise<AuthUser | null> {
  if (isDev(event)) {
    return null;
  }
  const userIdFromMetadata = event.user.app_metadata?.[riskSmartUserIdField];
  if (userIdFromMetadata) {
    const user = await getRiskSmartUserById(event, userIdFromMetadata);
    if (user && user.length === 1) {
      console.log('User found by metadata Id');

      return user[0];
    }
    if (user.length > 1) {
      console.error('Multiple users found by metadata Id', {
        userIdFromMetadata,
      });
    }
  }

  const auth0UserId = event.user.user_id;
  if (!auth0UserId) {
    throw new Error('No user id found');
  }
  const userById = await getRiskSmartUserById(event, auth0UserId);
  if (userById && userById.length === 1) {
    console.log('User found by id');

    return userById[0];
  }
  if (userById.length > 1) {
    console.error('Multiple users found by Id', { userById });
  }

  const userByAuthUserId = await getRiskSmartUserByAuthUserId(
    event,
    auth0UserId
  );
  if (userByAuthUserId && userByAuthUserId.length === 1) {
    console.log('User found by auth0 user id');

    return userByAuthUserId[0];
  }
  if (userByAuthUserId && userByAuthUserId.length > 1) {
    console.error('Multiple users found by AuthUser_Id', { auth0UserId });
  }

  if (event.user.email_verified) {
    const userByEmail = await getUserByEmail(event);
    if (userByEmail && userByEmail.length === 1) {
      console.log('User found by email address');

      return userByEmail[0];
    }
    if (userByEmail.length > 1) {
      console.error('Multiple users found by email', {
        email: event.user.email,
      });
    }
  }

  return null;
}

/**
    Get existing RiskSmart users by Id

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {string} userId - The user id to search for
 */
async function getRiskSmartUserById(
  event: Event,
  userId: string
): Promise<GetUserByIdQuery['auth_user']> {
  const result = await executeGraphql<
    GetUserByIdQuery,
    GetUserByIdQueryVariables
  >(event, GetUserByIdGQL, {
    userId,
    // TODO: Handle no-non-null-assertion correctly
    /* eslint-disable-next-line */
    orgKey: event.organization?.id!,
  });

  return result.auth_user;
}

/**
    Get existing RiskSmart users where the AuthUser_Id matches the user_id in the event

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {string} userId - The user id to search for
 */
async function getRiskSmartUserByAuthUserId(
  event: Event,
  userId: string
): Promise<AuthUser[]> {
  const query = /* GraphQL */ `
    query getRiskSmartUserByAuthUserId($userId: String!, $orgKey: String!) {
      auth_user(where: { AuthUser_Id: { _eq: $userId } }) {
        Id
        FirstName
        LastName
        UserName
        Email
        AuthUser_Id
        External_Id
        DisplayName
        organisationusers(where: { OrgKey: { _eq: $orgKey } }) {
          RoleKey
          External_Id
        }
        IsCustomerSupport
      }
    }
  `;
  const variables = {
    userId,
    // TODO: Handle no-non-null-assertion correctly
    /* eslint-disable-next-line */
    orgKey: event.organization?.id!,
  };
  const result = await executeGraphql<
    GetRiskSmartUserByAuthUserIdQuery,
    GetRiskSmartUserByAuthUserIdQueryVariables
  >(event, query, variables);

  return result.auth_user;
}

/**
 *
 *  Retrieve user by email address
 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
async function getUserByEmail(event: Event): Promise<AuthUser[]> {
  const query = /* GraphQL */ `
    query GetOrgUserByEmail($email: String!, $orgKey: String!) {
      auth_user(where: { Email: { _ilike: $email } }) {
        Id
        FirstName
        LastName
        UserName
        Email
        AuthUser_Id
        External_Id
        DisplayName
        organisationusers(where: { OrgKey: { _eq: $orgKey } }) {
          RoleKey
          External_Id
        }
        IsCustomerSupport
      }
    }
  `;

  const variables = {
    // TODO: Handle no-non-null-assertion correctly
    /* eslint-disable-next-line */
    email: event.user.email?.toLowerCase()!,
    // TODO: Handle no-non-null-assertion correctly
    /* eslint-disable-next-line */
    orgKey: event.organization?.id!,
  };
  const result = await executeGraphql<
    GetOrgUserByEmailQuery,
    GetOrgUserByEmailQueryVariables
  >(event, query, variables);

  return result.auth_user;
}

/**
  Create a new RiskSmart user

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {string} role - The role to create the user with
 */
async function createRiskSmartUser(
  event: Event,
  role: string
): Promise<AuthUser | null> {
  if (isDev(event)) {
    return null;
  }

  console.log('Creating user in RiskSmart...');
  const mutation = /* GraphQL */ `
    mutation CreateUser(
      $OrgKey: String!
      $Id: String!
      $UserName: String!
      $DisplayName: String
      $Email: String!
      $AuthClient_Id: String
      $AuthClientName: String
      $AuthTenant: String
      $AuthConnection_Id: String
      $AuthConnection: String
      $RoleKey: String
      $AuthUser_Id: String
      $CreatedByUser: String
      $ModifiedByUser: String
    ) {
      insert_auth_user_one(
        object: {
          Id: $Id
          UserName: $UserName
          DisplayName: $DisplayName
          Email: $Email
          AuthClient_Id: $AuthClient_Id
          AuthClientName: $AuthClientName
          AuthTenant: $AuthTenant
          AuthConnection_Id: $AuthConnection_Id
          AuthConnection: $AuthConnection
          RoleKey: $RoleKey
          AuthUser_Id: $AuthUser_Id
          CreatedOn: "now()"
          CreatedByUser: $CreatedByUser
          ModifiedByUser: $ModifiedByUser
          LastSeen: "now()"
        }
        on_conflict: {
          constraint: user_pkey
          update_columns: [
            LastSeen
            AuthClient_Id
            AuthClientName
            AuthTenant
            AuthConnection_Id
            AuthConnection
            RoleKey
            AuthUser_Id
            ModifiedByUser
            ModifiedAtTimestamp
          ]
        }
      ) {
        Id
        FirstName
        LastName
        UserName
        Email
        AuthUser_Id
        External_Id
        DisplayName
        RoleKey
        organisationusers(where: { OrgKey: { _eq: $OrgKey } }) {
          RoleKey
        }
        IsCustomerSupport
      }
    }
  `;

  const variables = {
    // TODO: Handle no-non-null-assertion correctly
    /* eslint-disable-next-line */
    OrgKey: event.organization?.id!,
    Id: event.user.user_id!,
    UserName: event.user.email!,
    DisplayName: event.user.nickname,
    Email: event.user.email!,
    AuthClient_Id: event.client.client_id,
    AuthClientName: event.client.name,
    AuthTenant: event.tenant.id,
    AuthConnection_Id: event.connection.id,
    AuthConnection: event.connection.name,
    AuthUser_Id: event.user.user_id,
    RoleKey: role,
    CreatedByUser: auth0SystemId,
    ModifiedByUser: auth0SystemId,
  };

  const result = await executeGraphql<
    CreateUserMutation,
    CreateUserMutationVariables
  >(event, mutation, variables);
  if (!result.insert_auth_user_one) {
    throw new Error(`Failed to create user with id ${event.user.user_id}`);
  }

  return result.insert_auth_user_one;
}

/**
  Update an existing RiskSmart user

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param user - The user to update
 * @param {string} role - The role to update the user to
 */
async function updateRiskSmartUser(
  event: Event,
  user: AuthUser | null,
  role: string
): Promise<AuthUser | null> {
  if (isDev(event)) {
    return null;
  }
  if (!user) {
    throw new Error('Cannot update null user');
  }
  console.log('Updating user in RiskSmart...');

  const result = await executeGraphql<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >(event, UpdateUserGQL, {
    UserId: user.Id,
    // TODO: Handle no-non-null-assertion correctly
    /* eslint-disable-next-line */
    OrgKey: event.organization?.id!,
    AuthClient_Id: event.client.client_id,
    AuthClientName: event.client.name,
    AuthTenant: event.tenant.id,
    AuthConnection_Id: event.connection.id,
    AuthConnection: event.connection.name,
    AuthUser_Id: event.user.user_id,
    Email: event.user.email,
    RoleKey: role,
    ModifiedByUser: auth0SystemId,
  });
  if (!result.update_auth_user_by_pk) {
    throw new Error(`Failed to update user with id ${user.Id}`);
  }

  return result.update_auth_user_by_pk;
}

/**
 * Create user activity login log

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param user
 */
async function addUserActivityLoginLog(event: Event, user: AuthUser | null) {
  if (isDev(event) || !event.organization) {
    return;
  }
  if (!user) {
    throw new Error('Cannot update null user');
  }

  console.log('adding user activity login log');
  const userId = user.Id;
  const orgId = event.organization.id;

  const mutation = /* GraphQL */ `
    mutation insertUserActivityAudit(
      $Action: String!
      $ModifiedByUser: String!
      $OrgKey: String!
    ) {
      insert_auth_user_activity_audit_one(
        object: {
          Action: $Action
          ModifiedByUser: $ModifiedByUser
          OrgKey: $OrgKey
        }
      ) {
        OrgKey
      }
    }
  `;

  const variables = {
    Action: 'LOGIN',
    ModifiedByUser: userId,
    OrgKey: orgId,
  };

  const data = await executeGraphql<
    InsertUserActivityAuditMutation,
    InsertUserActivityAuditMutationVariables
  >(event, mutation, variables);

  return data?.insert_auth_user_activity_audit_one?.OrgKey;
}

/**
  Creates a user organization association record in hasura
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param user - The user to create the association for
 * @param {string} roleKey - The role to create the user with
 */
async function addUserToRisksmartOrg(
  event: Event,
  user: AuthUser | null,
  roleKey: string
) {
  if (isDev(event) || !event.organization) {
    return;
  }
  if (!user) {
    throw new Error('Cannot update null user');
  }

  console.log('adding user to organisation');
  const orgId = event.organization.id;
  const risksmartUserId = user.Id;

  const mutation = /* GraphQL */ `
    mutation addOrganisationUser(
      $orgId: String!
      $userId: String!
      $roleKey: String!
      $authConnection: String
      $authConnectionId: String
      $createdByUser: String
      $modifiedByUser: String
    ) {
      insert_auth_organisationuser_one(
        object: {
          OrgKey: $orgId
          User_Id: $userId
          RoleKey: $roleKey
          AuthConnection: $authConnection
          AuthConnection_Id: $authConnectionId
          LastSeen: "now()"
          CreatedByUser: $createdByUser
          ModifiedByUser: $modifiedByUser
        }
        on_conflict: {
          constraint: organisationUser_pkey
          update_columns: [
            RoleKey
            AuthConnection
            AuthConnection_Id
            LastSeen
            ModifiedByUser
            ModifiedAtTimestamp
          ]
        }
      ) {
        User_Id
        OrgKey
        RoleKey
        External_Id
      }
    }
  `;
  const variables = {
    orgId,
    userId: risksmartUserId,
    roleKey,
    authConnection: event.connection.name,
    authConnectionId: event.connection.id,
    createdByUser: auth0SystemId,
    modifiedByUser: auth0SystemId,
  };
  await executeGraphql<
    AddOrganisationUserMutation,
    AddOrganisationUserMutationVariables
  >(event, mutation, variables);
}

/**
 * Set token claims
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {API} api - Interface whose methods can be used to change the behavior of the login.
 * @param user
 * @param {string} roleKey
 */
function setClaims(
  event: Event,
  api: API,
  user: AuthUser | null,
  roleKey: string
) {
  console.log('Setting claims');
  const namespace = 'claims';
  const namespaceHasura = 'https://hasura.io/jwt/claims';
  const risksmartUserId = user?.Id ?? event.user.user_id;

  const organization = event.organization || {
    display_name: undefined,
    name: undefined,
    id: undefined,
    metadata: undefined,
  };
  const organizationName = organization?.display_name || organization.name;
  const organizationId = organization.id;
  const taxonomy = (organization.metadata || {}).taxonomy || 'default';
  const email = (event.user || {}).email;
  const nickname = (event.user || {}).nickname;
  const displayName = user ? getDisplayNameForUser(user, nickname) : nickname;
  const features = (organization.metadata || {}).features || '';
  const tenant = (organization.metadata || {}).tenant || 'MultiTenant';
  const logo = (organization.metadata || {}).logo || 'default';
  const roles = [roleKey];

  const DEFAULT_IDLE_TIMEOUT = '14400';
  const organizationUIIdleTimeout =
    (organization.metadata || {}).ui_idle_timeout || DEFAULT_IDLE_TIMEOUT; // Default to 4 hours if not set

  const hasuraClaims = {
    'x-hasura-default-role': roleKey,
    'x-hasura-allowed-roles': roles,
    'x-hasura-user-id': risksmartUserId,
    'x-hasura-org-id': organizationId,
    'x-hasura-taxonomy': taxonomy,
    'x-hasura-features': features,
    'x-hasura-tenant-name': tenant,
    'x-hasura-logo': logo,
    'x-hasura-is-customer-support': String(user?.IsCustomerSupport),
  };

  api.idToken.setCustomClaim(namespaceHasura, hasuraClaims);
  api.idToken.setCustomClaim(
    `${namespace}_organization_name`,
    organizationName
  );
  api.idToken.setCustomClaim(`${namespace}_email`, email);
  api.idToken.setCustomClaim(`${namespace}_username`, displayName);
  api.idToken.setCustomClaim(`${namespace}_roles`, roles);
  api.idToken.setCustomClaim(`${namespace}_tenant`, tenant);

  api.idToken.setCustomClaim(
    `${namespace}_organization_idle_timeout`,
    organizationUIIdleTimeout
  );

  api.accessToken.setCustomClaim(namespaceHasura, hasuraClaims);
  api.accessToken.setCustomClaim(`${namespace}_roles`, roles);
}

function chooseRole(event: Event, userRoles: string[] | undefined) {
  const features = (event?.organization?.metadata?.features || '').split(',');
  const nopublic = features.includes('nopublic');
  if (!userRoles || userRoles.length === 0) {
    // Check if this user has been marked as a third-party respondent for this
    // org via app_metadata. This handles the case where an existing app user
    // (Username-Password-Authentication) is added as a third-party contact to
    // another org — without this check they would get Public/NoAccess instead
    // of ThirdPartyRespondent.
    const thirdPartyOrgs = event.user.app_metadata?.third_party_orgs as
      | Record<string, boolean>
      | undefined;
    if (
      thirdPartyOrgs &&
      event.organization?.id &&
      thirdPartyOrgs[event.organization.id]
    ) {
      return 'ThirdPartyRespondent';
    }

    if (event.connection.name === 'Username-Password-ThirdParty') {
      return 'ThirdPartyRespondent';
    }

    if (nopublic) {
      return 'NoAccess';
    }

    return 'Public';
  }
  if (userRoles.includes('RiskManager')) {
    return 'RiskManager';
  }
  if (userRoles.includes('Standard')) {
    return 'Standard';
  }
  if (userRoles.includes('CustomerSupport')) {
    return 'CustomerSupport';
  }
  if (userRoles.includes('StandardEnhanced')) {
    return 'StandardEnhanced';
  }
  if (userRoles.includes('InternalAudit')) {
    return 'InternalAudit';
  }
  if (userRoles.includes('TechnicalSupport')) {
    return 'TechnicalSupport';
  }
  // If no role matches, return the top one
  if (nopublic && userRoles[0] === 'Public') {
    return 'NoAccess';
  }

  return userRoles[0];
}

function getDisplayNameForUser(user: AuthUser, nickname?: string) {
  return (
    user.DisplayName ||
    [user.FirstName, user.LastName].filter(Boolean).join(' ').trim() ||
    user.UserName ||
    user.Email ||
    nickname ||
    '-'
  );
}
/**
    Execute a graphql mutation/query

 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {string} query - The graphql query or mutation to execute
 * @param {object} variables - The variables to pass to the query or mutation
 */
async function executeGraphql<T, V>(
  event: Event,
  query: string,
  variables: V
): Promise<T> {
  const { data } = await axios.post(
    getTenantApiPath(event),
    {
      query,
      variables,
    },
    {
      headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': event.secrets.HASURA_ADMIN_SECRET,
        ...getTenantHeader(event),
      },
    }
  );
  if (data.errors) {
    console.log(data.errors);
    throw new Error('errors returned from Hasura');
  }

  return data.data;
}

/**
 * True if in dev env
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
function isDev(event: Event) {
  return event.tenant.id === event.secrets?.DEV_TENANT_ID;
}

/**
 * Get the tenant header for the request
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
function getTenantHeader(event: Event) {
  return { 'x-tenant-name': getTenant(event) };
}

/**
 * Get the tenant api path for the request
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
function getTenantApiPath(event: Event) {
  return event.secrets.HASURA_TENANT_API_ENDPOINT + '/v1/graphql';
}

/**
 * Get the tenant for the request
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 */
function getTenant(event: Event) {
  const organization = event.organization || {
    metadata: undefined,
  };

  return (organization.metadata || {}).tenant || 'MultiTenant';
}
