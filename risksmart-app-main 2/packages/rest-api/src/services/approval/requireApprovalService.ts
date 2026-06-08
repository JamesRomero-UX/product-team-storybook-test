import type { WorkflowId } from '@risksmart-app/shared/approvals/workflows';
import { getSessionData } from 'src/session';

import type { ActionInput } from '../../hasuraActionHelpers';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { ChangeRequestService } from '../change-request/change-request.service';
import type { WorkflowCheckResult } from './workflowUtils';
import { checkWorkflow } from './workflowUtils';

export interface ActionParams {
  id: string;
  orgKey: string;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  changeRequestId?: string;
}

export type Action = (actionParams: ActionParams) => unknown;

export interface Changes {
  [key: string]: unknown;
}

export interface RequireApprovalConfig {
  /**
   * Test whether this workflow applies
   * @param tenant
   * @returns true if applied
   */
  approvalCheck?: (
    tenant: string
  ) => (args: ActionParams, hasFileChanges?: boolean) => Promise<boolean>;
  approvalParentId?: (
    tenant: string
  ) => (args: ActionParams) => Promise<string | undefined>;
}

export interface ApprovalWorkflowDefinition<T extends Action> {
  workflow: WorkflowId;
  execute: (request: ActionInput<unknown>, force?: boolean) => T;
  executeBulkDryRun: (
    request: ActionInput<unknown>,
    force?: boolean
  ) => (args: ActionParams[]) => Promise<WorkflowCheckResult[]>;
  action: (tenant: string) => T;
  config: RequireApprovalConfig;
}

export type WorkflowType = 'create' | 'update' | 'delete';

export const requireApprovalService =
  <T extends Action>({
    workflow,
    type,
    action,
    config,
  }: {
    workflow: WorkflowId;
    type: WorkflowType;
    action: (tenant: string) => T;
    config: RequireApprovalConfig;
  }): ((tenant: string) => ApprovalWorkflowDefinition<T>) =>
  (tenant: string) => {
    const execute = (request: ActionInput<unknown>, force?: boolean) =>
      (async (actionParams: ActionParams) => {
        const sessionData = getSessionData(request.session_variables);
        const changeRequestService = ChangeRequestService({
          tenant,
          orgKey: sessionData.orgKey,
          userId: sessionData.userId,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });
        const adminChangeRequestService = ChangeRequestService({
          tenant,
          orgKey: sessionData.orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });

        const check = await checkWorkflow({
          tenant,
          request,
          config,
          workflow,
          type,
          actionParams,
          force,
        });
        if (check.extra?.deleteChangeRequestId) {
          await adminChangeRequestService.delete(
            check.extra.deleteChangeRequestId
          );
        }

        if (check.result === 'success') {
          return action(tenant)(actionParams);
        } else if (check.result === 'change-request-required') {
          const { data, type } = check.data;
          await changeRequestService.create(data, type);
        } else if (check.result === 'amend-change-request') {
          const { changeRequest, userId, changes } = check.data;
          await changeRequestService.amendChanges(
            changeRequest,
            userId,
            changes
          );
        }
      }) as T;

    const executeBulkDryRun =
      (request: ActionInput<unknown>, force?: boolean) =>
      async (args: ActionParams[]) => {
        const sessionData = getSessionData(request.session_variables);
        const checks = await Promise.all(
          args.map(async (arg) => ({
            arg,
            check: await checkWorkflow({
              tenant,
              request,
              config,
              workflow,
              type,
              actionParams: arg,
              force,
            }),
          }))
        );

        const adminChangeRequestService = ChangeRequestService({
          tenant,
          orgKey: sessionData.orgKey,
          userId: SYSTEM_USER,
          userRole: CUSTOMER_SUPPORT_ROLE,
        });

        const deleteChangeRequestIds = checks
          .map((check) => check.check.extra?.deleteChangeRequestId)
          .filter((id): id is string => !!id);

        if (deleteChangeRequestIds.length > 0) {
          await adminChangeRequestService.delete(deleteChangeRequestIds);
        }

        return checks.map(({ check }) => check);
      };

    return { workflow, config, execute, executeBulkDryRun, action };
  };
