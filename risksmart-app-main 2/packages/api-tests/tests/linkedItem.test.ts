import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertAssessment } from '../clients/assessmentClient';
import { buildAction } from '../data/action';
import { buildAssessment } from '../data/assessment';
import { buildControl } from '../data/control';
import { buildIssue } from '../data/issue';
import { buildInsertChildRisk, buildRisk } from '../data/risk';
import {
  anotherUser,
  internalAuditUser1,
  riskManagerUser1,
  setup,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('linkedItem', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 30000);

  afterEach(async () => {
    await teardown();
  });

  describe('insert', () => {
    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey can create a linked item',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        const insertResult = await apiClient.insertLinkedItems(
          { Targets: [control.Id!], Source: risk.Id! },
          {
            user,
          }
        );
        expect(insertResult?.linkItems?.Links[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getRiskLinksResult = await apiClient.getLinkedItems({
          Id: risk.Id!,
        });
        expect(getRiskLinksResult?.as_source.length).toEqual(1);
        expect(getRiskLinksResult?.as_target.length).toEqual(0);
        expect(getRiskLinksResult?.as_source[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getControlLinksResult = await apiClient.getLinkedItems({
          Id: control.Id!,
        });
        expect(getControlLinksResult?.as_target.length).toEqual(1);
        expect(getControlLinksResult?.as_source.length).toEqual(0);
        expect(getControlLinksResult?.as_target[0].RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1])(
      'Returns OK when request contains automatic parent links',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const parentRisk = buildRisk({});
        await apiClient.insertRisk({ objects: parentRisk });
        const { insertChildRisk: childRiskData } =
          await apiClient.insertChildRisk(
            {
              object: buildInsertChildRisk({
                ParentRiskId: parentRisk.Id,
                Tier: 2,
                ContributorUserIds: [anotherUser.Id!],
                OwnerUserIds: [anotherUser.Id!],
              }),
            },
            {
              user,
            }
          );
        const { insertChildRisk: furtherChildRiskData } =
          await apiClient.insertChildRisk(
            {
              object: buildInsertChildRisk({
                ParentRiskId: childRiskData!.Id,
                Tier: 3,
                ContributorUserIds: [anotherUser.Id!],
                OwnerUserIds: [anotherUser.Id!],
              }),
            },
            {
              user,
            }
          );
        const result = await apiClient.insertLinkedItems(
          {
            Targets: [
              parentRisk.Id!,
              furtherChildRiskData!.Id,
              childRiskData!.Id,
            ],
            Source: issue.Id!,
          },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0].RelationshipType).toEqual(
          'parent_child'
        );
        expect(result?.linkItems?.Links[1].RelationshipType).toEqual(
          'parent_child'
        );
        expect(result?.linkItems?.Links[2].RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      'Returns OK when items already linked, does not create new link - parent_child',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        const result = await apiClient.insertLinkedItems(
          { Targets: [control.Id!], Source: risk.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0].RelationshipType).toEqual(
          'parent_child'
        );

        const secondLinkResult = await apiClient.insertLinkedItems(
          { Targets: [control.Id!], Source: risk.Id! },
          {
            user,
          }
        );
        expect(secondLinkResult?.linkItems?.Links[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getRiskLinksResult = await apiClient.getLinkedItems({
          Id: risk.Id!,
        });
        expect(getRiskLinksResult?.as_source.length).toEqual(1);
        expect(getRiskLinksResult?.as_target.length).toEqual(0);
        expect(getRiskLinksResult?.as_source[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getControlLinksResult = await apiClient.getLinkedItems({
          Id: control.Id!,
        });
        expect(getControlLinksResult?.as_target.length).toEqual(1);
        expect(getControlLinksResult?.as_source.length).toEqual(0);
        expect(getControlLinksResult?.as_target[0].RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey - Returns OK when items already linked, does not create new link - sibling',
      async (user) => {
        const assessment = buildAssessment({});
        await insertAssessment(assessment);
        const assessment2 = buildAssessment({});
        await insertAssessment(assessment2);
        const result = await apiClient.insertLinkedItems(
          { Targets: [assessment2.Id!], Source: assessment.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0].RelationshipType).toEqual('sibling');

        const secondLinkResult = await apiClient.insertLinkedItems(
          { Targets: [assessment2.Id!], Source: assessment.Id! },
          {
            user,
          }
        );
        expect(secondLinkResult?.linkItems?.Links[0].RelationshipType).toEqual(
          'sibling'
        );

        const thirdLinkResult = await apiClient.insertLinkedItems(
          { Targets: [assessment.Id!], Source: assessment2.Id! },
          {
            user,
          }
        );
        expect(thirdLinkResult?.linkItems?.Links[0].RelationshipType).toEqual(
          'sibling'
        );

        // With bidirectional siblings, both assessments have records as source and target
        // The trigger automatically creates reverse sibling records
        const getAssessment2LinksResult = await apiClient.getLinkedItems({
          Id: assessment2.Id!,
        });
        // assessment2 is the target of the original link AND the source of the reverse link
        expect(getAssessment2LinksResult?.as_source.length).toEqual(1);
        expect(getAssessment2LinksResult?.as_target.length).toEqual(1);
        expect(
          getAssessment2LinksResult?.as_source[0].RelationshipType
        ).toEqual('sibling');
        expect(
          getAssessment2LinksResult?.as_target[0].RelationshipType
        ).toEqual('sibling');

        const getAssessmentLinksResult = await apiClient.getLinkedItems({
          Id: assessment.Id!,
        });
        // assessment is the source of the original link AND the target of the reverse link
        expect(getAssessmentLinksResult?.as_source.length).toEqual(1);
        expect(getAssessmentLinksResult?.as_target.length).toEqual(1);
        expect(getAssessmentLinksResult?.as_source[0].RelationshipType).toEqual(
          'sibling'
        );
        expect(getAssessmentLinksResult?.as_target[0].RelationshipType).toEqual(
          'sibling'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey validates if one of the items in the request is already linked',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const action = buildAction({});
        await apiClient.insertActions({
          objects: action,
        });
        const result = await apiClient.insertLinkedItems(
          { Targets: [control.Id!], Source: risk.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0]?.RelationshipType).toEqual(
          'parent_child'
        );
        const secondLinkResult = await apiClient.insertLinkedItems(
          { Targets: [issue.Id!, control.Id!, action.Id!], Source: risk.Id! },
          {
            user,
          }
        );
        expect(secondLinkResult?.linkItems?.Links[0]?.RelationshipType).toEqual(
          'parent_child'
        );
        const getRiskLinksResult = await apiClient.getLinkedItems({
          Id: risk.Id!,
        });
        expect(getRiskLinksResult?.as_source.length).toEqual(3);
        expect(getRiskLinksResult?.as_target.length).toEqual(0);
        expect(getRiskLinksResult?.as_source[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getControlLinksResult = await apiClient.getLinkedItems({
          Id: control.Id!,
        });
        expect(getControlLinksResult?.as_target.length).toEqual(1);
        expect(getControlLinksResult?.as_source.length).toEqual(0);
        expect(getControlLinksResult?.as_target[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getIssueLinksResult = await apiClient.getLinkedItems({
          Id: issue.Id!,
        });
        expect(getIssueLinksResult?.as_target.length).toEqual(1);
        expect(getIssueLinksResult?.as_source.length).toEqual(0);
        expect(getIssueLinksResult?.as_target[0].RelationshipType).toEqual(
          'parent_child'
        );
        const getActionLinksResult = await apiClient.getLinkedItems({
          Id: action.Id!,
        });
        expect(getActionLinksResult?.as_target.length).toEqual(1);
        expect(getActionLinksResult?.as_source.length).toEqual(0);
        expect(getActionLinksResult?.as_target[0].RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey can create a linked item to an action',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const action = buildAction({});
        await apiClient.insertActions({
          objects: action,
        });
        const result = await apiClient.insertLinkedItems(
          { Targets: [control.Id!], Source: action.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0].RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey can create a linked item to an issue',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const result = await apiClient.insertLinkedItems(
          { Targets: [control.Id!], Source: issue.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0]?.RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey can create a linked item to an assessment',
      async (user) => {
        const assessment = buildAssessment({});
        await insertAssessment(assessment);
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const result = await apiClient.insertLinkedItems(
          { Targets: [assessment.Id!], Source: issue.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0]?.RelationshipType).toEqual(
          'parent_child'
        );
      }
    );

    it.each([riskManagerUser1, internalAuditUser1])(
      '$RoleKey can create multiple linked items at once',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const action = buildAction({});
        await apiClient.insertActions({
          objects: action,
        });
        const result = await apiClient.insertLinkedItems(
          { Targets: [control.Id!, issue.Id!, action.Id!], Source: risk.Id! },
          {
            user,
          }
        );
        expect(result?.linkItems?.Links[0]?.RelationshipType).toEqual(
          'parent_child'
        );
      }
    );
  });
});
