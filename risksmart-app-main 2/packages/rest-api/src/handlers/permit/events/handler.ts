import { permitSDK } from '@risksmart-app/permitio/permit-sdk';
import * as Sentry from '@sentry/aws-serverless';
import { Permit } from 'permitio';
import { monoLambdaEventBridgeHandler } from 'src/eventBridgeHandler';
import { getSessionData } from 'src/session';
import { Config } from 'sst/node/config';

import { getEnvBoolean } from '../../../environment';
import { getLogger } from '../../../logger';
import {
  authUser,
  contributor,
  contributorGroup,
  linkedItem,
  node,
  owner,
  ownerGroup,
  userGroup,
  userGroupUser,
  userRole,
} from './entity-processors';
import { processGenericPermitEntity } from './processGenericPermitEntity';
import { processGroupChange } from './processGroupChange';
import { processGroupUserChange } from './processGroupUserChange';
import { processParentRelationEntity } from './processParentRelationEntity';
import { processUserChange } from './processUserChange';
import { processUserEntityChange } from './processUserEntityChange';
import { processUserRoleChange } from './processUserRoleChange';
import type { EntityPermitProcessor, TABLE_NAMES } from './types';

const logger = getLogger();
const permit = new Permit({
  token: Config.PDP_API_KEY,
});
const permitRsSDK = permitSDK(Config.PDP_API_KEY);

/**
 * Each processor transforms a Hasura table DataChanged event into a Permit.io action
 */
const TABLE_TO_PERMIT_PROCESSOR_MAP: {
  [key in TABLE_NAMES]: {
    name: string;
    entityPermitProcessor: EntityPermitProcessor;
  };
} = {
  node: node,
  linked_item: linkedItem,
  owner: owner,
  contributor: contributor,
  owner_group: ownerGroup,
  contributor_group: contributorGroup,
  user_group: userGroup,
  user_group_user: userGroupUser,
  user: authUser,
  user_role: userRole,
};

/**
 * Hasura DataChanged event handler for Permit.io sync
 *
 * Listens to Hasura "DataChanged" events from database tables and synchronizes
 * the corresponding permissions in Permit.io. This will process flat table-level events (as opposed to v3 EDA which uses enriched events).
 *
 * Event Flow:
 * 1. Hasura triggers a DataChanged event when a table row is inserted/updated/deleted
 * 2. This handler routes the event to the appropriate entity processor based on table name
 * 3. The entity processor transforms the event into a Permit.io action (GENERIC, GROUP, etc.)
 * 4. The corresponding Permit processor syncs the permission change to Permit.io
 *
 * Supported Tables to Permit Actions mapping:
 * - node                → GENERIC (create/delete resource instances)
 * - linked_item         → PARENT-RELATION (parent-child hierarchy)
 * - owner/contributor   → USER-ENTITY (role assignments)
 * - owner_group/contributor_group → USER-ENTITY (group role assignments)
 * - user_group          → GROUP (create/delete groups)
 * - user_group_user     → GROUP-USER (add/remove users from groups)
 * - user                → USER (sync user to Permit)
 * - user_role           → USER-ROLE (org-level role assignments)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = monoLambdaEventBridgeHandler<any, any, void>(
  async (event) => {
    let entityProcessor: {
      name: string;
      entityPermitProcessor: EntityPermitProcessor;
    };
    logger.info('Permit processor triggered');
    if (!getEnvBoolean('PERMIT_ENABLED', true)) {
      logger.info('Permit is disabled. Ending.');

      return;
    }

    const sessionData = getSessionData(event.detail.event.session_variables);

    const detailType = event['detail-type'];
    if (detailType !== 'DataChanged') {
      logger.info('Not a data change event. Ending.');

      return;
    } else {
      // Extract table name and find corresponding processor
      const dataChangeEventDetail = event.detail as { table: { name: string } };
      const tableName = dataChangeEventDetail?.table?.name as TABLE_NAMES;
      if (!tableName) {
        throw new Error('No table present on data change event');
      }
      entityProcessor = TABLE_TO_PERMIT_PROCESSOR_MAP[tableName];
    }

    if (!entityProcessor) {
      logger.info('Entity processor not found. Ending.');

      return;
    }

    const errors: Error[] = [];

    await Sentry.withScope(async (scope) => {
      await Sentry.startSpan({ name: entityProcessor.name }, async () => {
        scope.setTag('processor', entityProcessor.name);
        scope.setTransactionName(entityProcessor.name);
        try {
          logger.appendKeys({
            processor: entityProcessor.name,
          });
          logger.info('Processing table change event');

          const permitActionConfig =
            await entityProcessor.entityPermitProcessor(
              sessionData.tenant,
              event
            );
          logger.info('Executing Permit action', {
            permitAction: permitActionConfig.PermitAction,
          });

          switch (permitActionConfig.PermitAction) {
            // Resource instance lifecycle (node table)
            case 'GENERIC': {
              await processGenericPermitEntity(
                permit,
                permitRsSDK,
                permitActionConfig
              );
              break;
            }
            // User group lifecycle (user_group table): insert/update/delete groups themselves
            case 'GROUP': {
              await processGroupChange(permitRsSDK, permitActionConfig);
              break;
            }
            // Group membership (user_group_user table): insert/update/delete users from existing groups
            case 'GROUP-USER': {
              await processGroupUserChange(permitRsSDK, permitActionConfig);
              break;
            }
            // Parent-child hierarchy (linked_item table)
            case 'PARENT-RELATION': {
              await processParentRelationEntity(
                permit,
                permitRsSDK,
                permitActionConfig
              );
              break;
            }
            // Role/group role assignments on entities (owner/contributor, owner_group/contributor_group)
            case 'USER-ENTITY': {
              await processUserEntityChange(
                permit,
                permitRsSDK,
                permitActionConfig
              );
              break;
            }
            // Org-level role assignments (user_role table)
            case 'USER-ROLE': {
              await processUserRoleChange(
                permit,
                permitRsSDK,
                permitActionConfig,
                sessionData.tenant
              );
              break;
            }
            // User lifecycle (user table)
            case 'USER': {
              await processUserChange(permit, permitRsSDK, permitActionConfig);
              break;
            }
          }

          logger.info('Permit action completed successfully');
        } catch (error) {
          logger.error('Error processing Permit action', error as Error);
          scope.captureException(error);
          errors.push(error as Error);
        } finally {
          logger.resetKeys();
        }
      });
    });
    if (errors.length > 0) {
      logger.error('Permissions processing failed', {
        errors,
      });
      throw new AggregateError(errors);
    } else {
      logger.info('Permissions processing complete');
    }
  }
);
