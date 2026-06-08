import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { RelationFileInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

export const buildRelationFile = (
  overrides: Partial<RelationFileInsertInput> = {}
): RelationFileInsertInput => {
  return {
    ...defaultRelationFile,
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};

const defaultRelationFile: RelationFileInsertInput = {
  ParentType: ParentTypeEnum.Action,
  ModifiedAtTimestamp: undefined,

  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};
