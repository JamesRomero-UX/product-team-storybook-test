import { IssueAssessmentStatusEnum, ParentTypeEnum } from 'generated/graphql';
import { z } from 'zod';

import type { JiraIssueSchema } from '../schema';
import { N8nJiraIssueSchema } from '../schema';

export const AllicaJiraIssueSchema = z.intersection(
  N8nJiraIssueSchema,
  z.object({
    jiraIssueBody: z.object({
      key: z.string().min(1),
      fields: z
        .object({
          created: z.number(),
          reporter: z.object({
            accountId: z.string(),
          }),
          assignee: z
            .object({
              accountId: z.string(),
              displayName: z.string(),
            })
            .nullish(),
          summary: z
            .string()
            .min(1, { message: 'Summary / title is required' }),
          description: z.string().nullish(),
          // Impact & identification
          customfield_12577: z.string().nullish(),
          // Product
          customfield_12181: z
            .object(
              { value: z.string().min(1) },
              { message: 'Affected Product or Function is required' }
            )
            .nullish(),
          // Incident management ref
          customfield_10884: z.string().min(1).nullish(),
          // Affected Business Units
          customfield_12656: z
            .array(z.object({ value: z.string().min(1) }))
            .min(1)
            .nullish(),
          // Date occurred - risk events
          customfield_10632: z
            .string()
            .refine((date) => !isNaN(Date.parse(date)), {
              message: 'Invalid date format (date occurred)',
            })
            .nullish(),
          // Date occurred - incidents
          customfield_12578: z
            .string()
            .refine((date) => !isNaN(Date.parse(date)), {
              message: 'Invalid date format (date occurred)',
            })
            .nullish(),
          // Date identified - incidents
          customfield_12579: z
            .string()
            .refine((date) => !isNaN(Date.parse(date)), {
              message: 'Invalid date format (date identified)',
            })
            .nullish(),
          customfield_11191: z
            .object({
              value: z.string().min(1), // Primary risk taxonomy L1
              child: z.object({
                value: z.string().min(1), // Primary risk taxonomy L2
              }),
            })
            .nullish(),
          // Basel event category
          customfield_12658: z
            .object(
              { value: z.string().min(1) },
              { message: 'Basel event category is required' }
            )
            .nullish(),
          // Product or function owners
          customfield_16130: z
            .array(
              z.object({
                accountId: z.string(),
              })
            )
            .min(1, {
              message: 'At least one product or function owner is required',
            }),
          // Secondary owners
          customfield_16421: z
            .array(
              z.object({
                accountId: z.string(),
              })
            )
            .nullish(),
          // Request participants
          customfield_10050: z
            .array(
              z.object({
                accountId: z.string(),
              })
            )
            .nullish(),
          // Root cause and resolution
          customfield_12584: z.string().nullish(),
          // Financial Loss Impact Rating
          customfield_12586: z
            .object(
              { value: z.string().min(1) },
              { message: 'Financial loss impact rating is required' }
            )
            .nullish(),
          // Regulatory Impact Rating
          customfield_12587: z
            .object(
              { value: z.string().min(1) },
              { message: 'Regulatory impact rating is required' }
            )
            .nullish(),
          // Reputational Impact Rating
          customfield_12589: z
            .object(
              { value: z.string().min(1) },
              { message: 'Reputational impact rating is required' }
            )
            .nullish(),
          // Colleague Impact Rating
          customfield_12590: z
            .object(
              { value: z.string().min(1) },
              { message: 'Colleague impact rating is required' }
            )
            .nullish(),
          // Customer Resilience Impact Rating
          customfield_12588: z
            .object(
              { value: z.string().min(1) },
              { message: 'Customer resilience impact rating is required' }
            )
            .nullish(),
          // Incident Failure Categorisation
          customfield_12244: z
            .object({
              value: z.string().min(1), // Primary Root Cause Category L1
              child: z.object({
                value: z.string().min(1), // Primary Root Cause Category L2
              }),
            })
            .nullish(),
        })
        .superRefine((fields, ctx) => {
          let requiredFields: [keyof typeof fields, string][] = [];

          if (!fields.customfield_10884) {
            requiredFields = [['customfield_10632', 'Date occurred']];
          } else {
            requiredFields = [
              ['customfield_12656', 'Affected Business Units'],
              ['customfield_11191', 'Risk taxonomies'],
              ['customfield_12658', 'Basel event category'],
              ['customfield_12584', 'Root cause and resolution'],
              ['customfield_12586', 'Financial loss impact rating'],
              ['customfield_12587', 'Regulatory impact rating'],
              ['customfield_12589', 'Reputational impact rating'],
              ['customfield_12590', 'Colleague impact rating'],
              ['customfield_12588', 'Customer resilience impact rating'],
              ['customfield_12181', 'Product or function'],
              ['customfield_12244', 'Incident Failure Categorisation'],
              ['customfield_12578', 'Date occurred'],
              ['customfield_12579', 'Date identified'],
            ];
          }

          for (const [fieldKey, fieldName] of requiredFields) {
            if (!fields[fieldKey]) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${fieldName} required when Incident management ref is set`,
                path: [fieldKey],
              });
            }
          }
        }),
    }),
  })
);

export const AllicaJiraIssueSchemaWithTransform =
  AllicaJiraIssueSchema.transform<z.infer<typeof JiraIssueSchema>>((input) => {
    const {
      jiraIssueBody: { fields: fields, key: key },
    } = input;

    return {
      Issue: {
        Key: key,
        Title: fields.summary,
        Description: fields.customfield_10884
          ? (fields.customfield_12577 ?? '')
          : (fields.description ?? ''),
        ImpactsCustomer: false, // Allica does not provide this field
        IsExternalIssue: false, // Allica does not provide this field
        // Allica only sending closed or pending issues, based on incident management ref field
        AssessmentStatus: fields.customfield_10884
          ? IssueAssessmentStatusEnum.Closed
          : IssueAssessmentStatusEnum.Pending,
        DateOccurred:
          fields.customfield_12578 ?? fields.customfield_10632 ?? undefined,
        DateIdentified:
          fields.customfield_12579 ?? new Date(fields.created).toISOString(),
        // Combine primary and secondary owners
        OwnerAccountIds: [
          ...fields.customfield_16130.map(
            (owner: { accountId: string }) => owner.accountId
          ),
          ...(fields.customfield_16421?.map(
            (owner: { accountId: string }) => owner.accountId
          ) ?? []),
        ],
        ContributorAccountIds: fields.customfield_10050
          ? fields.customfield_10050.map(
              (participant: { accountId: string }) => participant.accountId
            )
          : [],
        RSUrl: undefined, // Todo: grab later when we have the custom field key
        CustomAttributeData: {
          '1717577326708_select': fields.customfield_12181?.value ?? undefined, // Product
          '1719574400477_text': fields.customfield_10884 ?? undefined, // Incident management ref
          '1717577717300_select': fields.customfield_12658?.value ?? undefined, // Basel event category
          // Primary risk taxonomy - the UI options are built by joining the values with ' - '
          // L1
          '1717670549930_select': fields.customfield_11191
            ? fields.customfield_11191.value
            : undefined,
          // L2
          '1717670568472_select': fields.customfield_11191
            ? [
                fields.customfield_11191.value,
                fields.customfield_11191.child.value,
              ].join(' - ')
            : undefined,
          // Risk event - risk business partner
          '1717577438882_select': fields.customfield_10884
            ? undefined
            : (fields.assignee?.displayName ?? undefined),
        },
        IssueAssessmentCustomAttributeData: {
          // Root cause and resolution
          '1756991891738_textarea': fields.customfield_12584 ?? undefined,
          // Financial Loss Impact Rating
          '1717671009400_select': fields.customfield_12586?.value ?? undefined,
          // Regulatory Impact Rating
          '1717671039637_select': fields.customfield_12587?.value ?? undefined,
          // Reputational Impact Rating
          '1717671113073_select': fields.customfield_12589?.value ?? undefined,
          // Colleague Impact Rating
          '1717671147751_select': fields.customfield_12590?.value ?? undefined,
          // Customer Resilience Impact Rating
          '1717671072969_select': fields.customfield_12588?.value ?? undefined,
          // Is an Issue needed to be raised to resolve longer term?
          '1757601406913_select': fields.customfield_10884 ? 'No' : undefined, // Always set to No for incidents (undefined for non-incidents)
          // Primary root cause L1
          '1756997076801_select': fields.customfield_11191
            ? fields.customfield_12244?.value
            : undefined,
          // Primary root cause L2
          '1756997372431_select': fields.customfield_11191
            ? [
                fields.customfield_12244?.value,
                fields.customfield_12244?.child.value,
              ].join('-')
            : undefined,
        },
      },
      IssueTypeOverride: ParentTypeEnum.IssueRiskEvent,
      IssueAssessmentTypeOverride: 'material-impact',
      FallbackUserId: input.fallbackUserId,
    };
  });
