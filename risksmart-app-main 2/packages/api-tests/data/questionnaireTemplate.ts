import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  InsertQuestionnaireTemplateInput,
  QuestionnaireTemplateInsertInput,
  UpdateQuestionnaireTemplateInput,
} from '../generated/graphql';

const defaultQuestionnaireTemplate: QuestionnaireTemplateInsertInput = {
  Title: 'DDQ',
  Description: 'Description',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildQuestionnaireTemplate = (
  overrides: Partial<QuestionnaireTemplateInsertInput> = {}
): QuestionnaireTemplateInsertInput => ({
  ...defaultQuestionnaireTemplate,
  Id: randomUUID(),
  CreatedByUser: getDefaultUserId(),
  ModifiedByUser: getDefaultUserId(),
  OrgKey: getDefaultOrgId(),
  ...overrides,
});

const defaultUpdateQuestionnaireTemplate: UpdateQuestionnaireTemplateInput = {
  Title: 'DDQ',
  Description: 'Description',
  Id: '',
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
};

export const buildUpdateQuestionnaireTemplate = (
  overrides: Partial<UpdateQuestionnaireTemplateInput> = {}
): UpdateQuestionnaireTemplateInput => ({
  ...defaultUpdateQuestionnaireTemplate,
  ...overrides,
});

const defaultInsertQuestionnaireTemplate: InsertQuestionnaireTemplateInput = {
  Title: 'DDQ',
  Description: 'Description',

  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
};

export const buildInsertQuestionnaireTemplate = (
  overrides: Partial<InsertQuestionnaireTemplateInput> = {}
): InsertQuestionnaireTemplateInput => ({
  ...defaultInsertQuestionnaireTemplate,
  ...overrides,
});
