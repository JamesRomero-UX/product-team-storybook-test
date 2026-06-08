import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createAcceptancesService } from '../../services/frontend/index';

export const acceptanceRouter = router({
  register: authedProcedure.query(async (req) => {
    const acceptanceService = createAcceptancesService();

    return acceptanceService.getAcceptancesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  getById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const acceptanceService = createAcceptancesService();

      return acceptanceService.getAcceptanceById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
  getByParentRiskId: authedProcedure
    .input(z.object({ riskId: z.string().uuid() }))
    .query(async (req) => {
      const acceptanceService = createAcceptancesService();

      return acceptanceService.getAcceptancesByParentRiskId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),
  insert: authedProcedure
    .input(
      z
        .object({
          ParentId: z.string().uuid(),
          DateAcceptedFrom: z.string().min(1),
          DateAcceptedTo: z.string().min(1),
          Title: z.string().min(1),
          Details: z.string().min(1),
          Status: z.nativeEnum(AcceptanceStatus),
          ApprovedByUser: z.string().nullable().optional(),
          ApprovedByUserGroup: z.string().uuid().nullable().optional(),
          RequestedByUser: z.string().nullable().optional(),
          RequestedByUserGroup: z.string().uuid().nullable().optional(),
          CustomAttributeData: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional(),
        })
        .refine(
          (d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null,
          {
            message:
              'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
            path: ['ApprovedByUserGroup'],
          }
        )
        .refine(
          (d) => d.RequestedByUser == null || d.RequestedByUserGroup == null,
          {
            message:
              'RequestedByUser and RequestedByUserGroup are mutually exclusive',
            path: ['RequestedByUserGroup'],
          }
        )
    )
    .mutation(async (req) => {
      const acceptanceService = createAcceptancesService();

      return acceptanceService.insertAcceptance(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentId: req.input.ParentId,
          DateAcceptedFrom: req.input.DateAcceptedFrom,
          DateAcceptedTo: req.input.DateAcceptedTo,
          Title: req.input.Title,
          Details: req.input.Details,
          Status: req.input.Status,
          ApprovedByUser: req.input.ApprovedByUser ?? null,
          ApprovedByUserGroup: req.input.ApprovedByUserGroup ?? null,
          RequestedByUser: req.input.RequestedByUser ?? null,
          RequestedByUserGroup: req.input.RequestedByUserGroup ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),
  update: authedProcedure
    .input(
      z
        .object({
          Id: z.string().uuid(),
          DateAcceptedFrom: z.string().min(1),
          DateAcceptedTo: z.string().min(1),
          Title: z.string(),
          Details: z.string(),
          Status: z.nativeEnum(AcceptanceStatus),
          ApprovedByUser: z.string().nullable().optional(),
          ApprovedByUserGroup: z.string().uuid().nullable().optional(),
          RequestedByUser: z.string().nullable().optional(),
          RequestedByUserGroup: z.string().uuid().nullable().optional(),
          CustomAttributeData: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional(),
        })
        .refine(
          (d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null,
          {
            message:
              'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
            path: ['ApprovedByUserGroup'],
          }
        )
        .refine(
          (d) => d.RequestedByUser == null || d.RequestedByUserGroup == null,
          {
            message:
              'RequestedByUser and RequestedByUserGroup are mutually exclusive',
            path: ['RequestedByUserGroup'],
          }
        )
    )
    .mutation(async (req) => {
      const acceptanceService = createAcceptancesService();

      return acceptanceService.updateAcceptance(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          Id: req.input.Id,
          DateAcceptedFrom: req.input.DateAcceptedFrom,
          DateAcceptedTo: req.input.DateAcceptedTo,
          Title: req.input.Title,
          Details: req.input.Details,
          Status: req.input.Status,
          ApprovedByUser: req.input.ApprovedByUser ?? null,
          ApprovedByUserGroup: req.input.ApprovedByUserGroup ?? null,
          RequestedByUser: req.input.RequestedByUser ?? null,
          RequestedByUserGroup: req.input.RequestedByUserGroup ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),
  delete: authedProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const acceptanceService = createAcceptancesService();

      return acceptanceService.deleteAcceptances(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ids
      );
    }),
});
