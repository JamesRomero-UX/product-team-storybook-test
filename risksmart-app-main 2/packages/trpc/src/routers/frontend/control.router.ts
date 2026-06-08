import { ControlType } from '@risksmart-app/domain/src/types/consts/control-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createControlService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const controlRouter = router({
  register: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid().optional(),
      })
    )
    .query(async (req) => {
      const controlService = createControlService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          parentId: req.input.parentId,
        },
        'Fetching controls register'
      );

      return controlService.getControlsRegister(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),

  controlById: authedProcedure
    .input(
      z.object({
        controlId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const controlService = createControlService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          controlId: req.input.controlId,
        },
        'Fetching control by id'
      );

      return controlService.getControlById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlId
      );
    }),

  controlsByUserId: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async (req) => {
      const controlService = createControlService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          user: req.input.userId,
        },
        'Fetching controls by user id'
      );

      return controlService.getControlsByUserId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.userId
      );
    }),

  controlsBasic: authedProcedure.query(async (req) => {
    const controlService = createControlService();
    logger.debug(req.ctx.user, 'Fetching controls basic');

    return controlService.getControlsBasic(req.ctx.user);
  }),

  insert: authedProcedure
    .input(
      z.object({
        ParentId: z.string().uuid().nullable().optional(),
        Title: z.string().min(1),
        Description: z.string().nullable().optional(),
        Type: z.nativeEnum(ControlType).nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OwnerUserIds: z.array(z.string()).optional(),
        OwnerGroupIds: z.array(z.string().uuid()).optional(),
        ContributorUserIds: z.array(z.string()).optional(),
        ContributorGroupIds: z.array(z.string().uuid()).optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
        Schedule: z
          .object({
            Frequency: z.nativeEnum(TestFrequency).nullable().optional(),
            ManualDueDate: z.string().nullable().optional(),
            StartDate: z.string().nullable().optional(),
            TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullable().optional(),
            TimeToCompleteValue: z.number().int().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const controlService = createControlService();

      return controlService.insertControl(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentId: req.input.ParentId ?? null,
          Title: req.input.Title,
          Description: req.input.Description ?? null,
          Type: req.input.Type ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
          OwnerUserIds: req.input.OwnerUserIds,
          OwnerGroupIds: req.input.OwnerGroupIds,
          ContributorUserIds: req.input.ContributorUserIds,
          ContributorGroupIds: req.input.ContributorGroupIds,
          TagTypeIds: req.input.TagTypeIds,
          DepartmentTypeIds: req.input.DepartmentTypeIds,
          Schedule: req.input.Schedule,
        }
      );
    }),
});
