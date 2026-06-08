import { addThirdPartyUserToOrg } from './addThirdPartyUserToOrg';
import { getDefaultRole } from './getDefaultRole';
import { getRoles } from './getRoles';
import { getUserByEmail } from './getUserByEmail';
import { inviteThirdPartyUserToOrg } from './inviteThirdPartyUserToOrg';
import {
  createOrganizationConnection,
  deleteOrganizationConnection,
} from './organizationConnection';
import { createSsoConnection, deleteSsoConnection } from './ssoConnection';
import {
  removeUsersFromOrg,
  triggerPasswordReset,
} from './thirdPartyContactAuth0';
import { updateOrgUserRoles } from './updateOrgUserRoles';

export const auth0Service = {
  getRoles,
  getUserByEmail,
  updateOrgUserRoles,
  getDefaultRole,
  addThirdPartyUserToOrg,
  inviteThirdPartyUserToOrg,
  triggerPasswordReset,
  removeUsersFromOrg,
  createSsoConnection,
  deleteSsoConnection,
  createOrganizationConnection,
  deleteOrganizationConnection,
};

export type {
  CreateSsoConnectionOptions,
  SsoConnectionResponse,
  SsoStrategy,
  UpdateSsoConnectionOptions,
} from './ssoConnection';
