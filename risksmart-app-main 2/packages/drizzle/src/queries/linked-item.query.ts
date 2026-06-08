import { AppetiteType } from '@risksmart-app/domain/src/types/consts/appetite-type';
import { RATING_TYPE_ASSESSMENT } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import {
  acceptance,
  action,
  actionUpdate,
  appetite,
  assessment,
  assessmentActivity,
  cause,
  consequence,
  control,
  controlGroup,
  document,
  impact,
  indicator,
  internalAuditEntity,
  internalAuditReport,
  issue,
  issueUpdate,
  linkedItem,
  obligation,
  obligation_change,
  risk,
  testResult,
  thirdParty,
} from './fragments/index';
import {
  ancestorContributors,
  owners,
  ownersAndContributors,
  schedule,
  tagsAndDepartments,
} from './utils';

export const getLinkItemsListConfig = {
  ...linkedItem,
  with: {
    target_node: {
      columns: {
        ObjectType: true,
        SequentialId: true,
      },
    },
    target_obligation: {
      ...obligation,
    },
    target_obligation_change: {
      ...obligation_change,
    },
    target_control: {
      ...control,
    },
    target_risk: {
      ...risk,
    },
    target_assessment: {
      ...assessment,
    },
    target_action: {
      ...action,
    },
    target_issue: {
      ...issue,
    },
    target_indicator: {
      ...indicator,
    },
    target_third_party: {
      ...thirdParty,
    },
    target_acceptance: {
      ...acceptance,
      with: {
        parents: {
          columns: {
            Id: true,
          },
          with: {
            risk: {
              columns: {
                Id: true,
              },
            },
          },
        },
      },
    },
    target_appetite: {
      ...appetite,
      with: {
        parents: {
          columns: {
            Id: true,
          },
          with: {
            risk: {
              columns: {
                Id: true,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'linked_item'>;

/**
 * Bring back all audit and compliance data, ignoring nested filtering.
 * This will be refactored out soon, so adding the extra complexity is redundant.
 */
export const getLinkedItemsQueryConfig = {
  columns: {
    Id: true,
    Source: true,
    Target: true,
    RelationshipType: true,
  },
  with: {
    target_node: {
      columns: {
        ObjectType: true,
        SequentialId: true,
      },
    },
    target_control: {
      ...control,
      with: {
        ...schedule,
        ...ownersAndContributors,
      },
    },
    target_control_group: {
      ...controlGroup,
    },
    target_obligation: {
      ...obligation,
      with: {
        ...schedule,
        ...ownersAndContributors,
      },
    },
    target_obligation_change: {
      ...obligation_change,
      with: {
        ...ownersAndContributors,
      },
    },
    target_document: {
      ...document,
      with: {
        ...schedule,
        ...ownersAndContributors,
      },
    },
    target_risk: {
      ...risk,
      with: {
        ...schedule,
        ...ownersAndContributors,
      },
    },
    target_assessment_activity: {
      ...assessmentActivity,
      with: {
        ownerGroups: {
          columns: {
            UserGroupId: true,
          },
        },
        owners: {
          columns: {
            UserId: true,
          },
        },
        parentInternalAuditReport: {
          columns: {
            Id: true,
          },
        },
        parentAssessment: {
          columns: {
            Id: true,
          },
        },
        parentComplianceMonitoringAssessment: {
          columns: {
            Id: true,
          },
        },
      },
    },
    target_assessment: {
      ...assessment,
      with: {
        ...ownersAndContributors,
      },
    },
    target_internal_audit_report: {
      ...internalAuditReport,
      with: {
        ...ownersAndContributors,
      },
    },
    target_internal_audit_entity: {
      ...internalAuditEntity,
      with: {
        businessArea: {
          columns: {
            Title: true,
            SequentialId: true,
            Id: true,
          },
        },
        ...ownersAndContributors,
      },
    },
    target_impact: {
      ...impact,
      with: {
        ...owners,
      },
    },
    target_obligation_impact: {
      columns: {
        Id: true,
        Description: true,
        ParentObligationId: true,
      },
    },
    target_impact_rating: {
      columns: {
        Id: true,
      },
      with: {
        impact: {
          ...impact,
          with: {
            ...owners,
          },
        },
      },
    },
    target_action: {
      ...action,
      with: {
        ...ownersAndContributors,
      },
    },
    target_indicator: {
      ...indicator,
      with: {
        ...schedule,
        ...ownersAndContributors,
      },
    },
    target_acceptance: {
      ...acceptance,
    },
    target_appetite: {
      ...appetite,
    },
    target_issue: {
      ...issue,
      with: {
        ...ownersAndContributors,
      },
    },
    target_consequence: {
      ...consequence,
    },
    target_cause: {
      ...cause,
    },
    target_test_result: {
      ...testResult,
    },
    target_action_update: {
      ...actionUpdate,
    },
    target_issue_update: {
      ...issueUpdate,
      with: {
        issue: {
          columns: {
            Type: true,
          },
        },
      },
    },
    target_third_party: {
      ...thirdParty,
      with: {
        ...ownersAndContributors,
      },
    } as const satisfies QueryConfig<'third_party'>,
  },
} as const satisfies QueryConfig<'linked_item'>;

export const getLinkedRisksByInternalAuditIdQueryConfig = {
  columns: {
    Id: true,
    Source: true,
    Target: true,
    RelationshipType: true,
  },
  with: {
    target_risk: {
      ...risk,
      with: {
        ...schedule,
        ...ownersAndContributors,
        ...tagsAndDepartments,
        ...ancestorContributors,
        createdByUser: {
          columns: {
            FriendlyName: true,
          },
        },
        parent: {
          columns: {
            Title: true,
          },
        },
        parentNode: {
          columns: {
            Id: true,
            SequentialId: true,
            ObjectType: true,
          },
        },
        appetites: {
          where: {
            appetite: {
              AppetiteType: { eq: AppetiteType.Risk },
            },
          },
          with: {
            appetite: {
              columns: {
                LowerAppetite: true,
                UpperAppetite: true,
                EffectiveDate: true,
                CreatedAtTimestamp: true,
              },
            },
          },
        },
        assessmentResults: {
          where: {
            riskAssessmentResult: {
              RatingType: {
                in: RATING_TYPE_ASSESSMENT,
              },
            },
          },
          columns: {
            ParentId: true,
          },
          with: {
            riskAssessmentResult: {
              columns: {
                Id: true,
                Rating: true,
                ControlType: true,
                Likelihood: true,
                Impact: true,
                CustomAttributeData: true,
                CreatedAtTimestamp: true,
                TestDate: true,
              },
            },
          },
        },
        controls: { columns: { ControlId: true } },
        indicators: { columns: { IndicatorId: true } },
        actions: { columns: { ActionId: true } },
      },
    },
  },
} as const satisfies QueryConfig<'linked_item'>;

export const getLinkedItemRisksQueryConfig = {
  columns: {
    Id: true,
    Source: true,
    Target: true,
    RelationshipType: true,
  },
  with: {
    target_risk: {
      ...risk,
    },
  },
} as const satisfies QueryConfig<'linked_item'>;

/**
 * Query configuration for linked items (parent-child relationships)
 */
export const getParentChildLinkedItemsQueryConfig = {
  columns: {
    Id: true,
    OrgKey: true,
    RelationshipType: true,
  },
  with: {
    source_node: {
      columns: {
        Id: true,
        OrgKey: true,
        ObjectType: true,
      },
    },
    target_node: {
      columns: {
        Id: true,
        OrgKey: true,
        ObjectType: true,
      },
    },
  },
} as const satisfies QueryConfig<'linked_item'>;
