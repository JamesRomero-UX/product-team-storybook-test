import type { QueryConfig } from '../db';
import { assessmentActivity } from './fragments/index';
import { owners, relationFiles } from './utils';

export const getAssessmentActivitiesRegisterQueryConfig = {
  ...assessmentActivity,
  with: {
    ...owners,
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    parentRisk: {
      columns: { Title: true, SequentialId: true },
      with: {
        scheduleState: {
          columns: {
            DueDate: true,
            OverdueDate: true,
          },
        },
      },
    },
    assignedUser: {
      columns: { Id: true, FriendlyName: true },
    },
    ...relationFiles,
  },
} as const satisfies QueryConfig<'assessment_activity'>;

export const getAssessmentRCSAActivitiesByAssessmentIdQueryConfig = {
  ...assessmentActivity,
  with: {
    parentRisk: {
      columns: {
        Title: true,
        SequentialId: true,
      },
    },
    assignedUser: {
      columns: {
        FriendlyName: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    ...relationFiles,
    ...owners,
  },
} as const satisfies QueryConfig<'assessment_activity'>;

export const getAssessmentActivitiesByParentIdConfig = {
  ...assessmentActivity,
  with: {
    assignedUser: {
      columns: {
        FriendlyName: true,
      },
    },
    ...relationFiles,
    ...owners,
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'assessment_activity'>;

export const myDueAssessmentActivitiesQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    RiskId: true,
    Status: true,
  },
  with: {
    parentRisk: {
      columns: {},
      with: {
        scheduleState: {
          columns: {
            DueDate: true,
            OverdueDate: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'assessment_activity'>;

export const getMyDueItemsAssessmentActivitiesConfig =
  myDueAssessmentActivitiesQueryConfig;
