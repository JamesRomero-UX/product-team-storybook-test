# Allica Jira to Issue Mapping

This handler transforms Jira issues from Allica's Jira instance into RiskSmart Issues. The mapping differs based on whether the issue is an **Incident** (has `customfield_10884` set) or a **Risk Event** (no incident management ref).

## Issue Type Detection

| Condition                         | Issue Type | Assessment Status |
| --------------------------------- | ---------- | ----------------- |
| `customfield_10884` is set        | Incident   | `Closed`          |
| `customfield_10884` is null/empty | Risk Event | `Pending`         |

## Field Mappings

### Core Issue Fields

| Jira Field              | Custom Field ID     | Schema Key                                       | Notes                                     |
| ----------------------- | ------------------- | ------------------------------------------------ | ----------------------------------------- |
| Key                     | -                   | `Issue.Key`                                      | Required                                  |
| Summary                 | -                   | `Issue.Title`                                    | Required                                  |
| Description             | -                   | `Issue.Description`                              | Used for **Risk Events** only             |
| Impact & Identification | `customfield_12577` | `Issue.Description`                              | Used for **Incidents** only               |
| Created                 | -                   | `Issue.DateIdentified`                           | Fallback when `customfield_12579` is null |
| Product/Function Owners | `customfield_16130` | `Issue.OwnerAccountIds`                          | Required (array of accountIds)            |
| Request Participants    | `customfield_10050` | `Issue.ContributorAccountIds`                    | Optional                                  |
| Reporter                | -                   | Custom attribute `1770031402555_usermultiselect` | Mapped to RiskSmart user ID               |
| Assignee                | -                   | Custom attribute `1717577438882_select`          | Display name used for Risk Events only    |

### Date Fields

| Jira Field                  | Custom Field ID     | Schema Key             | When Used                                     |
| --------------------------- | ------------------- | ---------------------- | --------------------------------------------- |
| Date Occurred (Incidents)   | `customfield_12578` | `Issue.DateOccurred`   | Incidents                                     |
| Date Occurred (Risk Events) | `customfield_10632` | `Issue.DateOccurred`   | Risk Events                                   |
| Date Identified             | `customfield_12579` | `Issue.DateIdentified` | Incidents (falls back to `created` timestamp) |

### Custom Attribute Mappings

#### Issue Custom Attributes (`CustomAttributeData`)

| Jira Field               | Custom Field ID           | RiskSmart Attribute Key               | Notes                       |
| ------------------------ | ------------------------- | ------------------------------------- | --------------------------- |
| Product                  | `customfield_12181`       | `1717577326708_select`                | Product or function value   |
| Incident Management Ref  | `customfield_10884`       | `1719574400477_text`                  | Only for incidents          |
| Basel Event Category     | `customfield_12658`       | `1717577717300_select`                |                             |
| Primary Risk Taxonomy L1 | `customfield_11191.value` | `1717670549930_select`                |                             |
| Primary Risk Taxonomy L2 | `customfield_11191`       | `1717670568472_select`                | Format: `"L1 - L2"`         |
| Risk Business Partner    | `assignee.displayName`    | `1717577438882_select`                | Risk Events only            |
| Affected Business Units  | `customfield_12656`       | `1769169141402_departmentmultiselect` | Mapped to department IDs    |
| Reporter (User)          | `reporter.accountId`      | `1770031402555_usermultiselect`       | Mapped to RiskSmart user ID |

#### Issue Assessment Custom Attributes (`IssueAssessmentCustomAttributeData`)

| Jira Field                 | Custom Field ID           | RiskSmart Attribute Key  | Notes                                                  |
| -------------------------- | ------------------------- | ------------------------ | ------------------------------------------------------ |
| Root Cause & Resolution    | `customfield_12584`       | `1756991891738_textarea` |                                                        |
| Financial Loss Impact      | `customfield_12586`       | `1717671009400_select`   |                                                        |
| Regulatory Impact          | `customfield_12587`       | `1717671039637_select`   |                                                        |
| Reputational Impact        | `customfield_12589`       | `1717671113073_select`   |                                                        |
| Colleague Impact           | `customfield_12590`       | `1717671147751_select`   |                                                        |
| Customer Resilience Impact | `customfield_12588`       | `1717671072969_select`   |                                                        |
| Is Issue Needed?           | -                         | `1757601406913_select`   | Always `"No"` for incidents, undefined for risk events |
| Primary Root Cause L1      | `customfield_12244.value` | `1756997076801_select`   | Only when risk taxonomy is set                         |
| Primary Root Cause L2      | `customfield_12244`       | `1756997372431_select`   | Format: `"L1-L2"`                                      |

## Required Fields by Issue Type

### When Incident Management Ref IS SET (`customfield_10884` has value)

These fields are **required** for incidents:

| Field Name                        | Custom Field ID     | Validation  |
| --------------------------------- | ------------------- | ----------- |
| Affected Business Units           | `customfield_12656` | ✅ Required |
| Risk Taxonomies                   | `customfield_11191` | ✅ Required |
| Basel Event Category              | `customfield_12658` | ✅ Required |
| Root Cause & Resolution           | `customfield_12584` | ✅ Required |
| Financial Loss Impact Rating      | `customfield_12586` | ✅ Required |
| Regulatory Impact Rating          | `customfield_12587` | ✅ Required |
| Reputational Impact Rating        | `customfield_12589` | ✅ Required |
| Colleague Impact Rating           | `customfield_12590` | ✅ Required |
| Customer Resilience Impact Rating | `customfield_12588` | ✅ Required |
| Product or Function               | `customfield_12181` | ✅ Required |
| Incident Failure Categorisation   | `customfield_12244` | ✅ Required |
| Date Occurred                     | `customfield_12578` | ✅ Required |
| Date Identified                   | `customfield_12579` | ✅ Required |

### When Incident Management Ref IS NOT SET (Risk Event)

These fields are **required** for risk events:

| Field Name    | Custom Field ID     | Validation  |
| ------------- | ------------------- | ----------- |
| Date Occurred | `customfield_10632` | ✅ Required |

All other fields listed above become **optional** for risk events.

## Always Required Fields

Regardless of issue type, these fields are always required:

| Field Name              | Custom Field ID     | Validation                     |
| ----------------------- | ------------------- | ------------------------------ |
| Key                     | -                   | ✅ Required (non-empty string) |
| Summary                 | -                   | ✅ Required (non-empty string) |
| Reporter                | -                   | ✅ Required (accountId)        |
| Product/Function Owners | `customfield_16130` | ✅ Required (at least 1)       |

## User Mapping

The handler performs user mapping from Jira account IDs to RiskSmart user IDs:

1. **Reporter** → Mapped to custom attribute `1770031402555_usermultiselect`
2. **Owners** (`customfield_16130`) → Mapped to `Issue.OwnerAccountIds`, then resolved to RiskSmart users
3. **Participants** (`customfield_10050`) → Mapped to `Issue.ContributorAccountIds`

If a Jira user cannot be matched to a RiskSmart user, the `fallbackUserId` is used.

### Owner Fallback Logic

If all owners resolve to the fallback user and an assignee exists, the assignee's account ID is used as the owner instead.

## Description Logic

| Issue Type | Source Field                                  | Notes                      |
| ---------- | --------------------------------------------- | -------------------------- |
| Incident   | `customfield_12577` (Impact & Identification) | Falls back to empty string |
| Risk Event | `description`                                 | Falls back to empty string |
