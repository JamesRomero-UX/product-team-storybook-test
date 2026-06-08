import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import TreeModel from 'tree-model';

const tree = new TreeModel();

interface ObjectType {
  id: string;
}

const AssessmentResults: TreeModel.Model<ObjectType>[] = [
  { id: ParentTypes.TestResult },
  { id: ParentTypes.RiskAssessmentResult },
  { id: ParentTypes.ObligationAssessmentResult },
  { id: ParentTypes.DocumentAssessmentResult },
];

const AssessmentHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Assessment,
  children: [
    ...AssessmentResults,
    { id: ParentTypes.Issue },
    { id: ParentTypes.Action },
    { id: ParentTypes.AssessmentActivity },
  ],
};

const ImpactHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Impact,
  children: [{ id: ParentTypes.ImpactRating }],
};

const ActionHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Action,
  children: [{ id: ParentTypes.ActionUpdate }],
};

const IssueHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Issue,
  children: [
    { id: ParentTypes.IssueUpdate },
    ActionHierarchy,
    { id: ParentTypes.Cause },
    { id: ParentTypes.Consequence },
    { id: ParentTypes.IssueAssessment },
  ],
};

const IndicatorHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Indicator,
  children: [{ id: ParentTypes.IndicatorResult }],
};

const ControlHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Control,
  children: [
    { id: ParentTypes.TestResult },
    IssueHierarchy,
    ActionHierarchy,
    IndicatorHierarchy,
  ],
};

const ControlGroupHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.ControlGroup,
  children: [ControlHierarchy],
};

const ObligationHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Obligation,
  children: [
    ControlHierarchy,
    ...AssessmentResults,
    { id: ParentTypes.ObligationChange },
    { id: ParentTypes.ObligationImpact },
    ActionHierarchy,
    IssueHierarchy,
  ],
};

const RiskHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Risk,
  children: [
    ControlHierarchy,
    ...AssessmentResults,
    ImpactHierarchy,
    { id: ParentTypes.Appetite },
    { id: ParentTypes.Acceptance },
    ActionHierarchy,
    IndicatorHierarchy,
  ],
};

const ThirdPartyResponseHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.ThirdPartyResponse,
};

const QuestionnaireTemplateVersionHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.QuestionnaireTemplateVersion,
  children: [ThirdPartyResponseHierarchy],
};

const QuestionnaireTemplateHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.QuestionnaireTemplate,
  children: [QuestionnaireTemplateVersionHierarchy],
};

const ThirdPartyHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.ThirdParty,
  children: [
    ThirdPartyResponseHierarchy,
    ControlHierarchy,
    ActionHierarchy,
    IssueHierarchy,
  ],
};

const DocumentHierarchy: TreeModel.Model<ObjectType> = {
  id: ParentTypes.Document,
  children: [
    ...AssessmentResults,
    ActionHierarchy,
    IssueHierarchy,
    {
      id: ParentTypes.DocumentFile,
      children: [{ id: ParentTypes.AttestationRecord }],
    },
  ],
};

const Root = tree.parse({
  id: 'root',
  children: [
    RiskHierarchy,
    ThirdPartyHierarchy,
    QuestionnaireTemplateHierarchy,
    ObligationHierarchy,
    DocumentHierarchy,
    ControlGroupHierarchy,
    AssessmentHierarchy,
  ],
});

export const isDescendant = (
  ancestorObjectType: ParentType,
  descendantObjectType: ParentType
): boolean => {
  const ancestorNode = Root.first(
    (node) => node.model.id === ancestorObjectType
  );
  if (!ancestorNode) {
    return false;
  }
  const descendantNode = ancestorNode.first((node) => {
    return node.model.id === descendantObjectType;
  });

  return !!descendantNode && descendantNode !== ancestorNode;
};
