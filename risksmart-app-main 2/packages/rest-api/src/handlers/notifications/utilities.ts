import { Knock } from '@knocklabs/node';
import type { Workflows } from '@knocklabs/node/dist/src/resources/workflows';
import { DATE_TIME_FORMAT_WITH_TIME } from '@risksmart-app/shared/knock/schemas';
import type { EventBridgeEvent } from 'aws-lambda';
import { getEnvBoolean, getOptionalEnv } from 'src/environment';
import { getHasuraClient } from 'src/graphqlClient';
import { getAuthConnectionsForUsers } from 'src/services/user/userAuthConnectionService';
import type { SessionData } from 'src/session';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import { getOrgDetails } from '../../services/orgUtilities';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import {
  getAncestorContributors,
  getObjectContributors,
  getObjectContributorsGroups,
  getObjectDepartments,
  getObjectModifiedUser,
  getObjectOwnerGroups,
  getObjectOwners,
  getRecipientObjects,
} from './recipientUtilities';

const logger = getLogger();

export interface NotificationObject {
  Id: string;
  OrgKey: string;
  OrgName: string;
  Actor: string;
  WorkflowKey: string;
  TimeStamp: string;
  Title: string;
  SequenceId: number | string;
  Tenant: string;
  IdempotencyKey: string;
  SessionActor: string;
  ParentId?: string;
  ParentTitle?: string;
  ParentSequenceId?: string;
  ParentUrl?: string;
}

export interface NotificationArrayObject {
  collection?: string;
  email?: string;
  id: string;
  name: string;
  // Auth0 connection name for this specific user/group recipient (if applicable)
  connection?: string;
}

export const createNotificationObject = (
  sessionData: SessionData
): NotificationObject => {
  return {
    Id: '',
    OrgKey: '',
    OrgName: '',
    Actor: '',
    WorkflowKey: '',
    TimeStamp: '',
    Title: '',
    SequenceId: '',
    Tenant: sessionData.tenant,
    IdempotencyKey: '',
    SessionActor: sessionData.userId,
  };
};

export const checkEventAndEnvironmentStatus = (
  e: EventBridgeEvent<string, DataChangeEvent<unknown, string>>,
  eventNames: string[]
) => {
  if (eventNames.includes(e.detail.table.name)) {
    logger.appendKeys({
      tableName: e.detail.table.name,
    });

    return;
  }

  if (eventNames.includes(e.detail.trigger.name)) {
    logger.appendKeys({
      triggerName: e.detail.trigger.name,
    });

    return;
  }
  throw new Error(
    `Event type not supported, Table Name or Event Name :${e.detail.table.name} not in ${eventNames}`
  );
};

export const getRecipients = async (messageObject: NotificationObject) => {
  // Org name should already be populated before calling this function if needed for templates.

  const recipientObjects = await getRecipientObjects({
    objectId: messageObject.Id,
    orgKey: messageObject.OrgKey,
    eventKey: messageObject.WorkflowKey,
    departmentIds: await getObjectDepartments({
      objectId: messageObject.Id,
      tenant: messageObject.Tenant,
    }),
  });

  const recipientOwners = await getObjectOwners({
    objectId: messageObject.Id,
    tenant: messageObject.Tenant,
  });

  const recipientOwnerGroups = await getObjectOwnerGroups({
    objectId: messageObject.Id,
    tenant: messageObject.Tenant,
  });

  const recipientContributors = await getObjectContributors({
    objectId: messageObject.Id,
    tenant: messageObject.Tenant,
  });

  const ancestorContributors = await getAncestorContributors({
    objectId: messageObject.Id,
    tenant: messageObject.Tenant,
  });

  const recipientContributorsGroups = await getObjectContributorsGroups({
    objectId: messageObject.Id,
    tenant: messageObject.Tenant,
  });

  const modifiedByUser = await getObjectModifiedUser({
    objectId: messageObject.Actor ?? '',
    tenant: messageObject.Tenant,
    orgKey: messageObject.OrgKey,
  });

  return {
    modifiedByUser,
    recipientObjects,
    recipientOwners,
    recipientContributors,
    ancestorContributors,
    recipientOwnerGroups,
    recipientContributorsGroups,
  };
};

export interface SendNotificationsOptions {
  extraRecipients?: NotificationArrayObject[];
  extraData?: { [key: string]: string };
  excludeOwners?: boolean;
  excludeContributors?: boolean;
  includeInherited?: boolean;
  excludeAncestorContributors?: boolean;
}

export const sendNotifications = async (
  messageObject: NotificationObject,
  options?: SendNotificationsOptions
) => {
  const {
    modifiedByUser,
    recipientObjects,
    recipientOwners,
    recipientContributors,
    ancestorContributors,
    recipientOwnerGroups,
    recipientContributorsGroups,
  } = await getRecipients(messageObject);

  // Retrieve org meta & auth connection for deep link support
  const orgMeta = await getOrgDetails({
    orgKey: messageObject.OrgKey,
    tenant: messageObject.Tenant,
  });
  messageObject.OrgName = orgMeta.OrgName;

  logger.info('Sending notification to knock', {
    workflowKey: messageObject.WorkflowKey,
    recipientObjects,
    recipientOwnerIds: recipientOwners.map((c) => c.id),
    recipientContributorIds: recipientContributors.map((c) => c.id),
    ancestorContributorIds: ancestorContributors.map((c) => c.id),
    recipientOwnerGroupIds: recipientOwnerGroups.map((c) => c.id),
    recipientContributorsGroupIds: recipientContributorsGroups.map((c) => c.id),
  });

  //Call checkIdempotency and exit if false
  const idempotencyKeyExists = await checkIdempotencyKeyExists(
    messageObject.IdempotencyKey,
    Table[
      `${messageObject.Tenant}_IdempotencyNotificationCheck` as keyof typeof Table
    ].tableName
  );

  if (idempotencyKeyExists) {
    logger.info(`Idempotency check failed: ${messageObject.IdempotencyKey}`);

    return;
  }
  logger.info(`Idempotency check passed`);

  // Build initial recipient list (without connection)
  const arrayOfObjects: NotificationArrayObject[] = [
    ...(recipientObjects.map((recipient) => ({
      collection: recipient.collection,
      id: recipient.id,
      name: recipient.name,
    })) || []),
    // TODO: Are these ternary checks necessary?
    // eslint-disable-next-line no-constant-binary-expression
    ...(new Set(
      options?.excludeOwners
        ? []
        : recipientOwners.map((recipient) => ({
            email: recipient.email,
            id: recipient.id,
            name: recipient.name,
          }))
    ) || []),
    // TODO: Are these ternary checks necessary?
    // eslint-disable-next-line no-constant-binary-expression
    ...(new Set(
      options?.excludeContributors
        ? []
        : recipientContributors.map((recipient) => ({
            email: recipient.email,
            id: recipient.id,
            name: recipient.name,
          }))
    ) || []),
    // TODO: Are these ternary checks necessary?
    // eslint-disable-next-line no-constant-binary-expression
    ...(new Set(
      options?.excludeContributors || options?.excludeAncestorContributors
        ? []
        : ancestorContributors.map((recipient) =>
            recipient.group
              ? {
                  collection: 'Org-user-groups',
                  id: `${messageObject.OrgKey}-${recipient.id}`,
                  name: recipient.name,
                  email: recipient.email,
                }
              : {
                  email: recipient.email,
                  id: recipient.id,
                  name: recipient.name,
                }
          )
    ) || []),
    // TODO: Are these ternary checks necessary?
    // eslint-disable-next-line no-constant-binary-expression
    ...(new Set(
      options?.excludeOwners || !options?.includeInherited
        ? []
        : recipientOwnerGroups.map((recipient) => ({
            collection: 'Org-user-groups',
            id: `${messageObject.OrgKey}-${recipient.id}`,
            name: recipient.name,
            email: recipient.email,
          }))
    ) || []),
    // TODO: Are these ternary checks necessary?
    // eslint-disable-next-line no-constant-binary-expression
    ...(new Set(
      options?.excludeContributors
        ? []
        : recipientContributorsGroups.map((recipient) => ({
            collection: 'Org-user-groups',
            id: `${messageObject.OrgKey}-${recipient.id}`,
            name: recipient.name,
            email: recipient.email,
          }))
    ) || []),
    ...new Set(options?.extraRecipients ?? []),
  ]
    .filter((a) => Object.keys(a).length !== 0)
    .reduce<NotificationArrayObject[]>((accumulator, currentItem) => {
      // Check if the accumulator already has an item with the same id
      if (!accumulator.some((item) => item.id === currentItem.id)) {
        accumulator.push(currentItem as NotificationArrayObject); // Add type assertion to fix the error
      }

      return accumulator;
    }, []);

  // Enrich with per-user auth connection resolved via organisationusers table
  try {
    const userRecipientIds = arrayOfObjects
      .filter((r) => r.collection !== 'Org-user-groups')
      .map((r) => r.id);
    const adminClient = getHasuraClient({
      tenantName: messageObject.Tenant,
      adminSecret: Config.HASURA_ADMIN_SECRET,
    });
    const connectionsMap = await getAuthConnectionsForUsers(
      adminClient,
      userRecipientIds,
      messageObject.OrgKey
    );
    arrayOfObjects.forEach((r) => {
      if (r.collection !== 'Org-user-groups') {
        const conn = connectionsMap.get(r.id);
        if (conn) {
          r.connection = conn;
        }
      }
    });
  } catch (e) {
    logger.warn('Failed to enrich auth connections for recipients', {
      error: (e as Error).message,
    });
  }

  // Recipients already include per-user auth connection (if any) from enrichment step above
  const enrichedRecipients = arrayOfObjects;

  logger.info('Triggering notification', {
    workflowKey: messageObject.WorkflowKey,
  });

  await triggerNotification(
    messageObject.WorkflowKey,
    {
      actor: {
        email: modifiedByUser[0]?.email ?? 'RiskSmart System',
        id: modifiedByUser[0]?.id ?? 'SYSTEM',
        name: modifiedByUser[0]?.name ?? 'System Message',
      },
      recipients: enrichedRecipients,
      data: {
        org_id: messageObject.OrgKey,
        objectId: messageObject.Id,
        objectTitle: messageObject.Title,
        objectSequenceId: messageObject.SequenceId,
        objectTimeStamp: messageObject.TimeStamp
          ? new Date(messageObject.TimeStamp).toLocaleString(
              'en-GB',
              DATE_TIME_FORMAT_WITH_TIME
            )
          : '',
        objectParent: {
          id: messageObject.ParentId,
          title: messageObject.ParentTitle,
          sequenceId: messageObject.ParentSequenceId,
          url: messageObject.ParentUrl,
        },
        orgName: messageObject.OrgName,
        // New optional deep link context values for Knock templates and future URL builders
        deepLinkBaseUrl: orgMeta.Meta?.baseUrl, // undefined until populated on organisation meta
        deepLinkOrgId: messageObject.OrgKey,
        // Per-recipient connection now exposed on each recipient object (NotificationArrayObject.connection)
        ...options?.extraData,
      },
      tenant: messageObject.OrgKey,
    },
    {
      idempotencyKey: messageObject.IdempotencyKey,
    }
  );

  logger.info('Notification triggered. Setting idempotency key');

  await setIdempotency(
    messageObject.IdempotencyKey,
    Table[
      `${messageObject.Tenant}_IdempotencyNotificationCheck` as keyof typeof Table
    ].tableName
  );

  logger.info('Set idempotency key.');
};

/**
 * Knock trigger proxy with conditional check on whether notifications are enabled for local dev
 * @param workflowKey
 * @param rest
 * @returns
 */
export const triggerNotification: Workflows['trigger'] = async (
  workflowKey,
  ...rest
) => {
  if (
    process.env.IS_LOCAL &&
    !getEnvBoolean('LOCAL_NOTIFICATIONS_ENABLED', true)
  ) {
    // Don't send notifications when running sst:dev
    logger.warn(
      'Notifications disabled for local dev. Set LOCAL_NOTIFICATIONS_ENABLED env variables to enable'
    );

    return { workflow_run_id: 'disabled for IS_LOCAL' };
  }
  logger.info('Sending notification to knock', { workflowKey });
  const host = getOptionalEnv('KNOCK_HOST');
  const knockClient = new Knock(Config.KNOCK_SECRET_KEY, { host });

  return await knockClient.workflows.trigger(workflowKey, ...rest);
};
