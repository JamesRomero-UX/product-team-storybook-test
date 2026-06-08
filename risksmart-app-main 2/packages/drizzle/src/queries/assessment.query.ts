import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import { ancestorContributor, assessment } from './fragments/index';
import { ownersAndContributors, tagsAndDepartments } from './utils';

export const getAssessmentListQueryConfig = {
  ...assessment,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'assessment'>;

export const getAssessmentsRegisterQueryConfig = {
  ...assessment,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    assessmentResults: {
      with: {
        riskAssessmentResult: {
          columns: { Id: true },
          with: {
            parents: {
              where: { ParentType: { eq: ParentTypes.Risk } },
              with: { risk: { columns: { Id: true, Title: true } } },
            },
          },
        },
        obligationAssessmentResult: {
          columns: { Id: true },
          with: {
            parents: {
              where: { ParentType: { eq: ParentTypes.Obligation } },
              with: { obligation: { columns: { Id: true, Title: true } } },
            },
          },
        },
        documentAssessmentResult: {
          columns: { Id: true },
          with: {
            parents: {
              where: { ParentType: { eq: ParentTypes.Document } },
              with: { document: { columns: { Id: true, Title: true } } },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'assessment'>;

export const getAssessmentByIdQueryConfig = {
  ...assessment,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ancestorContributors: {
      ...ancestorContributor,
      with: {
        user: {
          columns: {
            FriendlyName: true,
          },
        },
        user_group: {
          columns: {
            Name: true,
          },
        },
      },
    },
    completedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'assessment'>;

export const myAssessmentsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Summary: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'assessment'>;

export const myDueAssessmentsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Summary: true,
    Status: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'assessment'>;

export const getMyDueItemsAssessmentsQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    TargetCompletionDate: true,
    Status: true,
  },
  with: {
    ...ownersAndContributors,
  },
} as const satisfies QueryConfig<'assessment'>;
