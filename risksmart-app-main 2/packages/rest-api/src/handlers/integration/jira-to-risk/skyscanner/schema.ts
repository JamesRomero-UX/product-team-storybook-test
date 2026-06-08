import { RiskStatusTypeEnum } from 'generated/graphql';
import { z } from 'zod';

import type { JiraRiskSchema } from '../schema';
import { N8nHookSchema } from '../schema';

export const SkyscannerJiraRiskSchema = z.intersection(
  N8nHookSchema,
  z.object({
    jiraIssueBody: z.object({
      key: z.string().min(1),
      fields: z.object({
        reporter: z.object({
          accountId: z.string(),
          emailAddress: z.string().email().nullish(),
        }),
        assignee: z
          .object({
            accountId: z.string(),
            emailAddress: z.string().email().nullish(),
          })
          .nullish(),
        summary: z.string().min(1, { message: 'Required' }),
        description: z.string().nullish(),
        status: z.object({
          id: z.union([
            z.literal(10016), // New
            z.literal(10031), // Triaged
            z.literal(1), // Allocated for fix
            z.literal(3), // In Progress
            z.literal(10021), // Accepted risk
            z.literal(10005), // Avoided / transferred / mitigated
          ]),
        }),
        customfield_10067: z.string().nullish(), // Status summary
        customfield_10151: z
          .object({
            value: z.coerce.number().int().min(0).max(5).nullish(), // Likelihood
          })
          .optional(),
        customfield_10095: z
          .object({
            value: z.coerce.number().int().min(0).max(5).nullish(), // Impact
          })
          .optional(),
        customfield_10278: z.number().int().nullish(), // Rating / Score
        customfield_15170: z.string().nullish(), // Custom field for RS risk URL
        customfield_10297: z
          .array(
            z
              .object({
                value: z.string().min(1).nullish(),
              })
              .nullish()
              .optional()
          )
          .nullish()
          .optional(), // Custom field core risk discipline
      }),
    }),
  })
);

export const SkyscannerJiraRiskSchemaWithTransform =
  SkyscannerJiraRiskSchema.transform<z.infer<typeof JiraRiskSchema>>(
    (input) => {
      const {
        jiraIssueBody: { fields: fields, key: key },
      } = input;

      let status: RiskStatusTypeEnum = RiskStatusTypeEnum.Emerging;
      switch (fields.status.id) {
        case 10016:
          status = RiskStatusTypeEnum.Emerging;
          break;
        case 10031:
        case 1:
        case 10021:
        case 3:
          status = RiskStatusTypeEnum.Active;
          break;
        case 10005:
          status = RiskStatusTypeEnum.Monitored;
          break;
      }

      return {
        Issue: {
          Title: fields.summary,
          Description: fields.description ?? '',
          Summary: fields.customfield_10067 ?? undefined,
          Status: status,
          Likelihood: fields.customfield_10151?.value ?? undefined,
          Impact: fields.customfield_10095?.value ?? undefined,
          Rating: fields.customfield_10278 ?? undefined,
          ContributorAccountId: fields.reporter.accountId,
          OwnerAccountId: fields.assignee
            ? fields.assignee.accountId
            : undefined,
          ContributorEmail: fields.reporter.emailAddress ?? undefined,
          OwnerEmail: fields.assignee
            ? (fields.assignee.emailAddress ?? undefined)
            : undefined,
          Key: key,
          RSUrl: fields.customfield_15170 ?? undefined,
          DepartmentNames: fields.customfield_10297?.length
            ? fields.customfield_10297
                .filter((item) => Boolean(item?.value))
                .map((item) => item!.value as string)
            : [],
        },
        RSUrlCustomFieldKey: 'customfield_15170',
        ParentRiskId: input.parentRiskId,
        JiraLinkCustomAttribute: input.jiraLinkCustomAttribute,
        RiskSummaryCustomAttribute: input.riskSummaryCustomAttribute,
        SetRefInJira: input.setRefInJira,
        FallbackUserId: input.fallbackUserId, // If Jira user has left, fallback to this user
      };
    }
  );
