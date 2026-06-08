import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import type {
  AttestationConfig,
  AttestationConfigBoolExp,
  AttestationConfigPartsFragment,
  AttestationGroup,
  AuthOrganisationuser,
  UserGroup,
  UserGroupUser,
} from 'generated/graphql';
import { UserStatusEnum } from 'generated/graphql';
import { getEnv } from 'src/environment';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';
import { isTableName } from 'src/handlers/events/isTableName';
import { getLogger } from 'src/logger';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from 'src/repositories/types';
import { AttestationConfigService } from 'src/services/attestation/attestation-config.service';
import { AttestationRecordService } from 'src/services/attestation/attestation-record.service';
import { DocumentVersionService } from 'src/services/document-version/document-version.service';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import { getSessionData } from 'src/session';

const logger = getLogger();

const THIRD_PARTY_RESPONDENT_ROLE = 'ThirdPartyRespondent';

export type AttestationRefreshEvent =
  | DataChangeEvent<AttestationConfig, 'attestation_config'>
  | DataChangeEvent<AttestationGroup, 'attestation_group'>
  | DataChangeEvent<AuthOrganisationuser, 'organisationuser'>
  | DataChangeEvent<UserGroup, 'user_group'>
  | DataChangeEvent<UserGroupUser, 'user_group_user'>;

export const handler = singleEventBridgeHandler<
  string,
  AttestationRefreshEvent,
  void
>(async ({ detail }) => {
  logger.info(`Attestation refresh triggered`, {
    tableName: detail.table?.name,
    op: detail.event.op,
  });
  if (isTableName(detail, 'organisationuser')) {
    const user = detail.event.data.new ?? detail.event.data.old;
    if (
      (detail.event.op === 'UPDATE' &&
        detail.event.data.new.OrgKey === detail.event.data.old.OrgKey) ||
      user.RoleKey === THIRD_PARTY_RESPONDENT_ROLE ||
      user.AuthConnection === getEnv('THIRD_PARTY_CONNECTION_NAME')
    ) {
      logger.info('Refresh for user not required', {
        authConnection: user.AuthConnection,
        roleKey: user.RoleKey,
      });

      return;
    }
  }
  const sessionData = getSessionData(detail.event.session_variables);
  const orgKey = detail.event.data.old?.OrgKey ?? detail.event.data.new?.OrgKey;
  logger.appendKeys({
    ...sessionData,
    orgKey,
  });
  const tenant = sessionData.tenant;
  if (!orgKey) {
    throw new Error(`No org key found for data ${detail.event.data}`);
  }

  if (!tenant) {
    throw new Error(
      `No tenant found for session variables ${detail.event.session_variables}`
    );
  }
  logger.info('Validating feature flags');

  const orgOptions = { orgKey, tenant };
  const { features, modules } = await getOrgModuleContext(orgOptions);
  const modulesSystemActive = features.includes('modules');

  const attestationsEnabled = resolveModuleEnabled({
    modules,
    moduleKey: 'document.subModules.attestation',
    modulesSystemActive,
    features,
  });
  if (!attestationsEnabled) {
    logger.info(`"document.subModules.attestation" module not enabled`);

    return;
  }

  if (features.includes('attestation_improvements')) {
    // skip this to avoid double processing and notifications being sent
    logger.info('Attestation cycles are enabled. Skipping refresh.');

    return;
  }

  logger.info('Attestation flags enabled, processing refresh.');

  const configService = AttestationConfigService({
    orgKey,
    tenant,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  // Get all configs that are affected by the change
  const configs = await configService.findWhere(getAttestationWhere(detail));
  logger.info(`Found ${configs.length} configs to refresh`);

  const refreshExpiry =
    detail.event.op === 'UPDATE' &&
    isTableName(detail, 'attestation_config') &&
    detail.event.data.old.AttestationTimeLimit !==
      detail.event.data.new.AttestationTimeLimit;

  // refresh attestation records for all affected configs
  await Promise.all(
    configs.map(async (config) => {
      await refreshAttestationRecords({
        tenant,
        orgKey,
        config,
        refreshExpiry,
      });
      logger.info(`Config refreshed`, { parentId: config.ParentId });
    })
  );
});

export const refreshAttestationRecords = async ({
  tenant,
  orgKey,
  config,
  refreshExpiry,
}: {
  tenant: string;
  orgKey: string;
  config: AttestationConfigPartsFragment;
  refreshExpiry?: boolean;
}) => {
  const configService = AttestationConfigService({
    tenant,
    orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const recordService = AttestationRecordService({
    tenant,
    orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const documentVersionService = DocumentVersionService({
    tenant,
    orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const documentFile =
    await documentVersionService.findLatestPublishedByParentDocumentId(
      config.ParentId
    );
  if (!documentFile) {
    logger.info(`Published version not found`, { parentId: config.ParentId });

    return;
  }

  const users = await configService.getAttestationUsers(config);
  await recordService.refreshRequiredUsersForNode({
    config,
    nodeId: documentFile.Id,
    userIds: users
      .filter((u) => u.Status === UserStatusEnum.Active)
      .filter((u) => u.Id)
      .map((u) => u.Id!),
    refreshExpiry: !!refreshExpiry,
  });
  logger.info(`Attestations refreshed`, {
    configId: config.ParentId,
    nodeId: documentFile.Id,
  });
};

const getAttestationWhere = (
  e: AttestationRefreshEvent
): AttestationConfigBoolExp => {
  if (isTableName(e, 'attestation_config')) {
    const data = e.event.op === 'DELETE' ? e.event.data.old : e.event.data.new;

    return {
      ParentId: { _eq: data.ParentId },
    };
  } else if (isTableName(e, 'attestation_group')) {
    const data = e.event.op === 'DELETE' ? e.event.data.old : e.event.data.new;

    return {
      ParentId: { _eq: data.ConfigId },
    };
  } else if (isTableName(e, 'user_group_user')) {
    const data = e.event.op === 'DELETE' ? e.event.data.old : e.event.data.new;

    return {
      groups: {
        GroupId: { _eq: data.UserGroupId },
      },
    };
  } else if (isTableName(e, 'user_group')) {
    const data = e.event.op === 'DELETE' ? e.event.data.old : e.event.data.new;

    return {
      groups: {
        GroupId: { _eq: data.Id },
      },
    };
  } else if (isTableName(e, 'organisationuser')) {
    const data = e.event.op === 'DELETE' ? e.event.data.old : e.event.data.new;

    return {
      _or: [
        {
          groups: {
            group: {
              users: {
                UserId: { _eq: data.User_Id },
              },
            },
          },
        },
        {
          RequireGlobalAttestation: { _eq: true },
        },
      ],
    };
  }
  throw new Error('Unknown table');
};
