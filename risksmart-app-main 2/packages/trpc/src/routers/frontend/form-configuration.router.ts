import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createFormConfigurationService } from '../../services/frontend/index';

/**
 * Option field schemas for custom attribute fields
 */
const stringOption = z.object({
  _tag: z.literal('StringOption'),
  Value: z.string(),
});

const altValueOption = z.object({
  _tag: z.literal('AltValueOption'),
  AltValue: z.string(),
  Value: z.string(),
});

const optionFieldSchema = z.discriminatedUnion('_tag', [
  stringOption,
  altValueOption,
]);

/**
 * Common fields shared across create/update operations
 */
const commonFieldsSchema = z.object({
  ParentType: z.nativeEnum(ParentTypes),
  Required: z.boolean(),
  Hidden: z.boolean(),
  ReadOnly: z.boolean(),
  DefaultValue: z.string().nullish(),
  Conditions: z.unknown().nullish(),
});

/**
 * Schema for creating a form field
 */
const createFormFieldSchema = z
  .object({
    IsCustomField: z.literal(true),
    Label: z.string().min(1, 'Label is required'),
    AltLabel: z.string().optional(),
    Description: z.string().nullish(),
    Type: z.string(),
    Options: z.array(optionFieldSchema),
  })
  .merge(commonFieldsSchema);

/**
 * Schema for updating a form field (custom)
 */
const updateCustomFieldSchema = z.object({
  IsCustomField: z.literal(true),
  Label: z.string().min(1, 'Label is required for custom fields'),
  AltLabel: z.string().optional(),
  Description: z.string().nullish(),
  Options: z.array(optionFieldSchema),
});

/**
 * Schema for updating a form field (standard)
 */
const updateStandardFieldSchema = z.object({
  IsCustomField: z.literal(false),
  Label: z.string().nullish(),
  Description: z.string().nullish(),
});

/**
 * Schema for updating a form field
 */
const updateFormFieldSchema = z
  .discriminatedUnion('IsCustomField', [
    updateCustomFieldSchema,
    updateStandardFieldSchema,
  ])
  .and(commonFieldsSchema)
  .and(
    z.object({
      FieldId: z.string().min(1, 'FieldId is required'),
    })
  );

/**
 * Schema for deleting a form field
 */
const deleteFormFieldSchema = z.object({
  ParentType: z.nativeEnum(ParentTypes),
  FieldId: z.string().min(1, 'FieldId is required'),
});

export const formConfigurationRouter = router({
  getByParentTypes: authedProcedure
    .input(z.object({ parentTypes: z.array(z.nativeEnum(ParentTypes)) }))
    .query(async (req) => {
      const formConfigurationService = createFormConfigurationService();

      return formConfigurationService.getByParentTypes(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentTypes
      );
    }),

  canUpdateFormConfig: authedProcedure
    .input(z.object({ resourceType: z.string() }))
    .query(async (req) => {
      const formConfigurationService = createFormConfigurationService();

      return formConfigurationService.canUpdateFormConfig(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.resourceType
      );
    }),

  createFormField: authedProcedure
    .input(createFormFieldSchema)
    .mutation(async (req) => {
      const formConfigurationService = createFormConfigurationService();

      return formConfigurationService.createFormField(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          IsCustomField: req.input.IsCustomField,
          ParentType: req.input.ParentType,
          Label: req.input.Label,
          AltLabel: req.input.AltLabel,
          Description: req.input.Description,
          Type: req.input.Type,
          Options: req.input.Options,
          Required: req.input.Required,
          Hidden: req.input.Hidden,
          ReadOnly: req.input.ReadOnly,
          DefaultValue: req.input.DefaultValue,
          Conditions: req.input.Conditions,
        }
      );
    }),

  updateFormField: authedProcedure
    .input(updateFormFieldSchema)
    .mutation(async (req) => {
      const formConfigurationService = createFormConfigurationService();

      return formConfigurationService.updateFormField(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentType: req.input.ParentType,
          FieldId: req.input.FieldId,
          IsCustomField: req.input.IsCustomField,
          Label: req.input.Label,
          AltLabel:
            req.input.IsCustomField === true ? req.input.AltLabel : undefined,
          Description: req.input.Description,
          Options: req.input.IsCustomField === true ? req.input.Options : [],
          Required: req.input.Required,
          Hidden: req.input.Hidden,
          ReadOnly: req.input.ReadOnly,
          DefaultValue: req.input.DefaultValue,
          Conditions: req.input.Conditions,
        }
      );
    }),

  deleteFormField: authedProcedure
    .input(deleteFormFieldSchema)
    .mutation(async (req) => {
      const formConfigurationService = createFormConfigurationService();

      return formConfigurationService.deleteFormField(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentType: req.input.ParentType,
          FieldId: req.input.FieldId,
        }
      );
    }),
});
