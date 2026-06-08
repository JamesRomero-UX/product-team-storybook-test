import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

const defaultControl: GetControlByIdQuery['control'][number] = {
  Id: '1',
  ancestorContributors: [],
  ModifiedByUser: '',
  Description: '',
  CreatedAtTimestamp: '',
  ModifiedAtTimestamp: '',
  Title: '',
  Type: 'Detective',
  tags: [],
  departments: [],
  owners: [],
  contributors: [],
  ownerGroups: [],
  contributorGroups: [],
  __typename: 'control',
  schedule: { Id: '1' },
};

export const buildControl = (
  overrides: Partial<GetControlByIdQuery['control'][number]>
): GetControlByIdQuery['control'][number] => {
  return {
    ...defaultControl,
    ...overrides,
  };
};
