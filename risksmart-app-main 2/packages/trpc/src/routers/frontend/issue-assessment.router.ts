import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/issue-assessment-status';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createIssueAssessmentService } from '../../services/frontend/index';

export const issueAssessmentRouter = router({
  insert: authedProcedure
    .input(
      z.object({
        ParentIssueId: z.string().uuid(),
        Severity: z.number().nullable().optional(),
        Status: z.nativeEnum(IssueAssessmentStatus).nullable().optional(),
        CertifiedIndividual: z.string().nullable().optional(),
        IssueType: z.string().nullable().optional(),
        ActualCloseDate: z.string().nullable().optional(),
        TargetCloseDate: z.string().nullable().optional(),
        PolicyOwnerCommentary: z.string().nullable().optional(),
        PolicyOwner: z.string().nullable().optional(),
        // no-dd-sa:typescript-best-practices/boolean-prop-naming
        PolicyBreach: z.boolean().nullable().optional(),
        // no-dd-sa:typescript-best-practices/boolean-prop-naming
        Reportable: z.boolean().nullable().optional(),
        PoliciesBreached: z.string().nullable().optional(),
        Rationale: z.string().nullable().optional(),
        // no-dd-sa:typescript-best-practices/boolean-prop-naming
        IssueCausedByThirdParty: z.boolean().nullable().optional(),
        SystemResponsible: z.string().nullable().optional(),
        // no-dd-sa:typescript-best-practices/boolean-prop-naming
        RegulatoryBreach: z.boolean().nullable().optional(),
        RegulationsBreached: z.string().nullable().optional(),
        ThirdPartyResponsible: z.string().nullable().optional(),
        // no-dd-sa:typescript-best-practices/boolean-prop-naming
        IssueCausedBySystemIssue: z.boolean().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
        RegulationsBreachedIds: z.array(z.string().uuid()).optional(),
        AssociatedControlIds: z.array(z.string().uuid()).optional(),
        PoliciesBreachedIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async (req) => {
      const issueAssessmentService = createIssueAssessmentService();

      return issueAssessmentService.insertIssueAssessment(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),
});
