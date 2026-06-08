import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/issue-assessment-status';
import {
  buildControl,
  buildDepartmentType,
  buildDocument,
  buildIssue,
  buildObligation,
  buildTagType,
  insertControl,
  insertDepartmentType,
  insertDocument,
  insertIssue,
  insertObligation,
  insertTagType,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('frontend.issueAssessment', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('insert', () => {
    it('should insert an issue assessment with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.issueAssessment.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        TagTypeIds: [],
        DepartmentTypeIds: [],
        RegulationsBreachedIds: [],
        AssociatedControlIds: [],
        PoliciesBreachedIds: [],
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an issue assessment with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      const insertedIssue = await insertIssue(parentIssue);

      const response = await trpcClient.frontend.issueAssessment.insert.mutate({
        ParentIssueId: insertedIssue!.Id,
        Severity: 3,
        Status: IssueAssessmentStatus.Open,
        CertifiedIndividual: userId,
        IssueType: 'Operational',
        ActualCloseDate: '2067-03-01T00:00:00.000Z',
        TargetCloseDate: '2067-06-01T00:00:00.000Z',
        PolicyOwnerCommentary: 'Policy owner review notes',
        PolicyOwner: userId,
        PolicyBreach: true,
        Reportable: false,
        PoliciesBreached: 'Data Retention Policy',
        Rationale: 'Assessment rationale text',
        IssueCausedByThirdParty: false,
        SystemResponsible: null,
        RegulatoryBreach: false,
        RegulationsBreached: null,
        ThirdPartyResponsible: null,
        IssueCausedBySystemIssue: false,
        CustomAttributeData: { customField: 'value', count: 42 },
        TagTypeIds: [],
        DepartmentTypeIds: [],
        RegulationsBreachedIds: [],
        AssociatedControlIds: [],
        PoliciesBreachedIds: [],
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an issue assessment with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.issueAssessment.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        Severity: null,
        Status: null,
        CertifiedIndividual: null,
        IssueType: null,
        ActualCloseDate: null,
        TargetCloseDate: null,
        PolicyOwnerCommentary: null,
        PolicyOwner: null,
        PolicyBreach: null,
        Reportable: null,
        PoliciesBreached: null,
        Rationale: null,
        IssueCausedByThirdParty: null,
        SystemResponsible: null,
        RegulatoryBreach: null,
        RegulationsBreached: null,
        ThirdPartyResponsible: null,
        IssueCausedBySystemIssue: null,
        CustomAttributeData: null,
        TagTypeIds: [],
        DepartmentTypeIds: [],
        RegulationsBreachedIds: [],
        AssociatedControlIds: [],
        PoliciesBreachedIds: [],
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with a non-existent parent issue ID', async () => {
      const { trpcClient } = context;

      const nonExistentIssueId = '00000000-0000-0000-0000-000000000000';

      await expect(
        trpcClient.frontend.issueAssessment.insert.mutate({
          ParentIssueId: nonExistentIssueId,
          TagTypeIds: [],
          DepartmentTypeIds: [],
          RegulationsBreachedIds: [],
          AssociatedControlIds: [],
          PoliciesBreachedIds: [],
        })
      ).rejects.toThrow(/parent issue not found/i);
    });

    it('should reject insert with an invalid UUID for ParentIssueId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.issueAssessment.insert.mutate({
          ParentIssueId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          TagTypeIds: [],
          DepartmentTypeIds: [],
          RegulationsBreachedIds: [],
          AssociatedControlIds: [],
          PoliciesBreachedIds: [],
        })
      ).rejects.toThrow(/invalid/i);
    });

    it('should insert an issue assessment with empty arrays for relationship fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);

      const response = await trpcClient.frontend.issueAssessment.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        TagTypeIds: [],
        DepartmentTypeIds: [],
        RegulationsBreachedIds: [],
        AssociatedControlIds: [],
        PoliciesBreachedIds: [],
      });

      expect(response.Id).toBeDefined();
    });

    it('should persist tags on parent issue and departments, obligations, controls and policies on assessment when TagTypeIds and DepartmentTypeIds are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentIssue = buildIssue(orgKey, userId);
      await insertIssue(parentIssue);
      const obligation = await insertObligation(
        buildObligation({ orgKey, userId })
      );
      const control = await insertControl(buildControl(orgKey, userId));
      const document = await insertDocument(buildDocument(orgKey, userId));

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Assessment Tag' })
      );
      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, {
          Name: 'Assessment Department',
        })
      );

      const response = await trpcClient.frontend.issueAssessment.insert.mutate({
        ParentIssueId: parentIssue.Id!,
        TagTypeIds: [tagType!.TagTypeId],
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
        RegulationsBreachedIds: [obligation!.Id],
        AssociatedControlIds: [control!.Id],
        PoliciesBreachedIds: [document!.Id],
      });

      expect(response.Id).toBeDefined();

      const assessmentData =
        await trpcClient.frontend.issue.issueAssessmentByParentId.query({
          parentIssueId: parentIssue.Id!,
        });

      // Tags are saved on the parent issue
      expect(assessmentData.issue).toHaveLength(1);
      expect(assessmentData.issue[0]?.tags).toHaveLength(1);
      expect(assessmentData.issue[0]?.tags[0]?.TagTypeId).toBe(
        tagType!.TagTypeId
      );

      // Departments are saved on the assessment
      expect(assessmentData.issue_assessment).toHaveLength(1);
      expect(assessmentData.issue_assessment[0]?.departments).toHaveLength(1);
      expect(
        assessmentData.issue_assessment[0]?.departments[0]?.DepartmentTypeId
      ).toBe(departmentType!.DepartmentTypeId);
      // Obligations, controls and policies are linked to the assessment via issue_parent
      const parents = assessmentData.issue_parent;
      expect(parents).toHaveLength(3);

      const obligationParent = parents.find(
        (p) => p.ParentId === obligation!.Id
      );
      expect(obligationParent?.parent?.ObjectType).toBe('obligation');

      const controlParent = parents.find((p) => p.ParentId === control!.Id);
      expect(controlParent?.parent?.ObjectType).toBe('control');

      const documentParent = parents.find((p) => p.ParentId === document!.Id);
      expect(documentParent?.parent?.ObjectType).toBe('document');
    });
  });
});
