// This is purely a hasura custom generated enum, it isn't backed by an enum table.
export const ThirdPartyResponseAction = {
  Approve: 'approve',
  Recall: 'recall',
  Reject: 'reject',
  RequestMoreInformation: 'request_more_information',
} as const;

export type ThirdPartyResponseAction =
  (typeof ThirdPartyResponseAction)[keyof typeof ThirdPartyResponseAction];
