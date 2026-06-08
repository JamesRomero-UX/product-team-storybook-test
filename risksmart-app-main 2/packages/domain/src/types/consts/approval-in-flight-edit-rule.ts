export enum ApprovalInFlightEditRule {
  /** Only approvers can edit */
  Approvers = 'approvers',
  /** Everyone who has access can edit */
  Everyone = 'everyone',
  /** No one can edit */
  Noone = 'noone',
}
