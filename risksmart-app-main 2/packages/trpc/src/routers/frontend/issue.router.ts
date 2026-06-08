import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createIssueService } from '../../services/frontend/index';
import { IssueTypeArray } from '../../services/service.types';

export const issueRouter = router({
  register: authedProcedure
    .input(
      z.object({
        issueType: z.enum(IssueTypeArray),
        tagTypeIds: z.array(z.string().uuid()).optional(),
        departmentTypeIds: z.array(z.string().uuid()).optional(),
      })
    )
    .query(async (req) => {
      const issueService = createIssueService();

      return issueService.getIssuesRegister(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.issueType as ParentType,
        req.input.departmentTypeIds,
        req.input.tagTypeIds
      );
    }),
  issueById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const issueService = createIssueService();

      return issueService.getById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
  issuesByParentId: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
        type: z.enum(IssueTypeArray),
      })
    )
    .query(async (req) => {
      const issueService = createIssueService();

      return issueService.getIssuesByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId,
        req.input.type as ParentType
      );
    }),
  issueAssessmentByParentId: authedProcedure
    .input(
      z.object({
        parentIssueId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const issueService = createIssueService();

      return issueService.getIssueAssessmentByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentIssueId
      );
    }),
  insert: authedProcedure
    .input(
      z.object({
        ParentId: z.string().uuid().nullable().optional(),
        Title: z.string().min(1),
        Details: z.string().nullable().optional(),
        ImpactsCustomer: z.boolean().nullable().optional(),
        IsExternalIssue: z.boolean().nullable().optional(),
        DateOccurred: z.string().min(1),
        DateIdentified: z.string().min(1),
        Type: z.enum(IssueTypeArray),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        Meta: z.record(z.string(), z.unknown()).nullable().optional(),
        OwnerUserIds: z.array(z.string()).optional(),
        OwnerGroupIds: z.array(z.string().uuid()).optional(),
        ContributorUserIds: z.array(z.string()).optional(),
        ContributorGroupIds: z.array(z.string().uuid()).optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async (req) => {
      const issueService = createIssueService();

      return issueService.insertIssue(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),
  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        Title: z.string().min(1),
        Details: z.string().nullable().optional(),
        ImpactsCustomer: z.boolean().nullable().optional(),
        IsExternalIssue: z.boolean().nullable().optional(),
        DateOccurred: z.string().min(1),
        DateIdentified: z.string().min(1),
        Type: z.enum(IssueTypeArray),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        Meta: z.record(z.string(), z.unknown()).nullable().optional(),
        OwnerUserIds: z.array(z.string()).optional(),
        OwnerGroupIds: z.array(z.string().uuid()).optional(),
        ContributorUserIds: z.array(z.string()).optional(),
        ContributorGroupIds: z.array(z.string().uuid()).optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
        OriginalTimestamp: z.string().min(1),
      })
    )
    .mutation(async (req) => {
      const issueService = createIssueService();

      return issueService.updateIssue(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),
  delete: authedProcedure
    .input(
      z.object({
        Ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const issueService = createIssueService();

      return issueService.deleteIssues(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.Ids
      );
    }),
});
