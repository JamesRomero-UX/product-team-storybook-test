import { Knock } from "../../knock";
import { MethodOptions, PaginatedEntriesResponse } from "../../common/interfaces";
import { CancelWorkflowProperties, TriggerWorkflowProperties, CreateSchedulesProps, UpdateSchedulesProps, ListSchedulesProps, DeleteSchedulesProps, Schedule, WorkflowRun } from "./interfaces";
export declare class Workflows {
    readonly knock: Knock;
    constructor(knock: Knock);
    trigger(workflowKey: string, { actor, recipients, cancellationKey, tenant, data: notifyData, }: TriggerWorkflowProperties, { idempotencyKey }?: MethodOptions): Promise<WorkflowRun>;
    cancel(workflowKey: string, cancellationKey: string, { recipients }?: CancelWorkflowProperties): Promise<any>;
    createSchedules(workflowKey: string, params: CreateSchedulesProps): Promise<Schedule[]>;
    updateSchedules(params: UpdateSchedulesProps): Promise<Schedule[]>;
    listSchedules(workflowKey: string, params?: ListSchedulesProps): Promise<PaginatedEntriesResponse<Schedule>>;
    deleteSchedules(params: DeleteSchedulesProps): Promise<Schedule[]>;
}
