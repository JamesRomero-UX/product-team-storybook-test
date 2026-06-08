import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';
import type {
  Acceptance_Bool_Exp,
  Action_Bool_Exp,
  Appetite_Parent_Bool_Exp,
  Cause_Bool_Exp,
  Consequence_Bool_Exp,
  Control_Bool_Exp,
  Indicator_Bool_Exp,
  Issue_Bool_Exp,
  Risk_Bool_Exp,
  Test_Result_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

const risksByEntity = (entityIds: string[]): Risk_Bool_Exp => ({
  enterpriseRiskInstance: {
    EntityId: {
      _in: entityIds,
    },
  },
});

const controlsByEntity = (entityIds: string[]): Control_Bool_Exp => ({
  parents: {
    risk: risksByEntity(entityIds),
  },
});

const controlTestsByEntity = (entityIds: string[]): Test_Result_Bool_Exp => ({
  parent: controlsByEntity(entityIds),
});

const issuesByEntity = (entityIds: string[]): Issue_Bool_Exp => ({
  _or: [
    {
      parents: {
        control: controlsByEntity(entityIds),
      },
    },
    {
      parents: {
        risk: risksByEntity(entityIds),
      },
    },
  ],
});

const causesByEntity = (entityIds: string[]): Cause_Bool_Exp => ({
  issue: issuesByEntity(entityIds),
});

const consequencesByEntity = (entityIds: string[]): Consequence_Bool_Exp => ({
  issue: issuesByEntity(entityIds),
});

const actionsByEntity = (entityIds: string[]): Action_Bool_Exp => ({
  parents: {
    _or: [
      { risk: risksByEntity(entityIds) },
      { control: controlsByEntity(entityIds) },
      { issue: issuesByEntity(entityIds) },
    ],
  },
});

const indicatorsByEntity = (entityIds: string[]): Indicator_Bool_Exp => ({
  parents: {
    _or: [
      { risk: risksByEntity(entityIds) },
      { control: controlsByEntity(entityIds) },
    ],
  },
});

const appetiteParentsByEntity = (
  entityIds: string[]
): Appetite_Parent_Bool_Exp => ({
  risk: risksByEntity(entityIds),
});

const acceptanceParentsByEntity = (
  entityIds: string[]
): Appetite_Parent_Bool_Exp => ({
  risk: risksByEntity(entityIds),
});

const acceptancesByEntity = (entityIds: string[]): Acceptance_Bool_Exp => ({
  parents: acceptanceParentsByEntity(entityIds),
});

const useEntityWhereFilter = <T>(
  objectType: Parent_Type_Enum,
  defaultValue: T | undefined = {} as T
): T => {
  const { entityIds } = useEntityFilter();
  if (!entityIds || entityIds.length === 0) {
    return { ...defaultValue };
  }
  switch (objectType) {
    case Parent_Type_Enum.Risk:
      return { ...risksByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Control:
      return { ...controlsByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.TestResult:
      return { ...controlTestsByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Issue:
      return { ...issuesByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Cause:
      return { ...causesByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Consequence:
      return { ...consequencesByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Action:
      return { ...actionsByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Indicator:
      return { ...indicatorsByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Appetite:
      return { ...appetiteParentsByEntity(entityIds), ...defaultValue };
    case Parent_Type_Enum.Acceptance:
      return { ...acceptancesByEntity(entityIds), ...defaultValue };
    default:
      return { ...defaultValue };
  }
};

export default useEntityWhereFilter;
