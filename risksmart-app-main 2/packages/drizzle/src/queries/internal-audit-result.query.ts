import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import {
  control,
  controlTestInternalAuditResult,
  documentInternalAuditResult,
  impactInternalAuditRating,
  obligationInternalAuditResult,
  riskControlledInternalAuditResultInternalAuditResult,
  riskUncontrolledInternalAuditResultInternalAuditResult,
} from './fragments/index';
import { ancestorContributors, relationFiles, schedule } from './utils';

export const getDocumentInternalAuditResultsQueryConfig = {
  ...documentInternalAuditResult,
  with: {
    ...relationFiles,
    ...ancestorContributors,
    parents: {
      where: {
        ParentType: ParentTypes.Document,
      },
      columns: {},
      with: {
        document: {
          columns: {
            Id: true,
            Title: true,
          },
        },
        node: {
          columns: {
            Id: true,
            SequentialId: true,
            ObjectType: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'document_internal_audit_result'>;

export const getObligationInternalAuditResultsQueryConfig = {
  ...obligationInternalAuditResult,
  with: {
    ...relationFiles,
    ...ancestorContributors,
    parents: {
      where: {
        ParentType: ParentTypes.Obligation,
      },
      columns: {},
      with: {
        obligation: {
          columns: {
            Id: true,
            Title: true,
          },
        },
        node: {
          columns: {
            Id: true,
            SequentialId: true,
            ObjectType: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'obligation_internal_audit_result'>;

export const getRiskControlledInternalAuditResultsQueryConfig = {
  ...riskControlledInternalAuditResultInternalAuditResult,
  with: {
    ...relationFiles,
    ...ancestorContributors,
    parents: {
      where: {
        ParentType: ParentTypes.Risk,
      },
      columns: {},
      with: {
        risk: {
          columns: {
            Id: true,
            Title: true,
          },
        },
        node: {
          columns: {
            Id: true,
            SequentialId: true,
            ObjectType: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk_controlled_internal_audit_result'>;

export const getRiskUncontrolledInternalAuditResultsQueryConfig = {
  ...riskUncontrolledInternalAuditResultInternalAuditResult,
  with: {
    ...relationFiles,
    ...ancestorContributors,
    parents: {
      where: {
        ParentType: ParentTypes.Risk,
      },
      columns: {},
      with: {
        risk: {
          columns: {
            Id: true,
            Title: true,
          },
        },
        node: {
          columns: {
            Id: true,
            SequentialId: true,
            ObjectType: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk_uncontrolled_internal_audit_result'>;

export const getControlTestInternalAuditResultsQueryConfig = {
  ...controlTestInternalAuditResult,
  with: {
    parent: {
      ...control,
      with: {
        ...schedule,
      },
    },
    ...relationFiles,
  },
} as const satisfies QueryConfig<'control_test_internal_audit_result'>;

export const getInternalAuditResultByIdQueryConfig = {
  columns: {
    Id: true,
    ParentId: true,
    ResultType: true,
    ParentType: true,
  },
  with: {
    obligationAssessmentResult: {
      ...obligationInternalAuditResult,
    },
    documentAssessmentResult: {
      ...documentInternalAuditResult,
    },
    controlledRiskAssessmentResult: {
      ...riskControlledInternalAuditResultInternalAuditResult,
    },
    uncontrolledRiskAssessmentResult: {
      ...riskUncontrolledInternalAuditResultInternalAuditResult,
    },
    testResult: {
      ...controlTestInternalAuditResult,
    },
    impactRating: {
      ...impactInternalAuditRating,
    },
  },
} as const satisfies QueryConfig<'internal_audit_result_parent'>;

export const getLatestDocumentInternalAuditResultByDocumentIdQueryConfig = {
  ...documentInternalAuditResult,
  with: {
    ...ancestorContributors,
    parents: {
      where: {
        ParentType: ParentTypes.InternalAuditReport,
      },
      columns: {},
      with: {
        internalAuditReport: {
          columns: {
            Id: true,
            Title: true,
            SequentialId: true,
            CreatedAtTimestamp: true,
            ModifiedAtTimestamp: true,
            CreatedByUser: true,
            ModifiedByUser: true,
            CustomAttributeData: true,
            CompletedByUser: true,
            Status: true,
          },
          with: {
            completedByUser: {
              columns: {
                FriendlyName: true,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'document_internal_audit_result'>;
