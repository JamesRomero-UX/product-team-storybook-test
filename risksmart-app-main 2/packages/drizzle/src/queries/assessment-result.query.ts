import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import {
  assessment,
  complianceMonitoringAssessment,
  documentAssessmentResult,
  impactRating,
  internalAuditReport,
  obligationAssessmentResult,
  riskAssessmentResult,
  riskControlledInternalAuditResult,
  riskControlledSecondLineResult,
  riskUncontrolledInternalAuditResult,
  riskUncontrolledSecondLineResult,
  testResult,
} from './fragments/index';
import { ancestorContributors } from './utils';

export const getDocumentAssessmentResultsQueryConfig = {
  ...documentAssessmentResult,
  with: {
    parents: {
      with: {
        assessment: {
          columns: {
            Id: true,
            Title: true,
            ActualCompletionDate: true,
            StartDate: true,
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
      where: {
        ParentType: { in: [ParentTypes.Assessment, ParentTypes.Document] },
      },
    },
    files: {
      with: {
        file: true,
      },
    },
  },
} as const satisfies QueryConfig<'document_assessment_result'>;

export const getObligationAssessmentResultQueryConfig = {
  ...obligationAssessmentResult,
  with: {
    parents: {
      with: {
        assessment: {
          columns: {
            Id: true,
            Title: true,
            ActualCompletionDate: true,
            StartDate: true,
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
      where: {
        ParentType: { in: [ParentTypes.Assessment, ParentTypes.Obligation] },
      },
    },
    files: {
      with: {
        file: true,
      },
    },
  },
} as const satisfies QueryConfig<'obligation_assessment_result'>;

export const getRiskAssessmentResultQueryConfig = {
  ...riskAssessmentResult,
  with: {
    parents: {
      with: {
        assessment: {
          columns: {
            Id: true,
            Title: true,
            ActualCompletionDate: true,
            StartDate: true,
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
      where: {
        ParentType: { in: [ParentTypes.Assessment, ParentTypes.Risk] },
      },
    },
    files: {
      with: {
        file: true,
      },
    },
  },
} as const satisfies QueryConfig<'risk_assessment_result'>;

export const getRiskAssessmentResultsByRiskIdQueryConfig = {
  ...riskAssessmentResult,
  with: {
    parents: {
      with: {
        assessment: {
          ...assessment,
          with: {
            completedByUser: {
              columns: {
                FriendlyName: true,
              },
            },
          },
        },
      },
      where: {
        ParentType: { in: [ParentTypes.Assessment] },
      },
    },
  },
} as const satisfies QueryConfig<'risk_assessment_result'>;

export const getAssessmentResultParentByIdQueryConfig = {
  columns: {
    Id: true,
    ParentId: true,
    ResultType: true,
    ParentType: true,
  },
  with: {
    obligationAssessmentResult: {
      ...obligationAssessmentResult,
    },
    documentAssessmentResult: {
      ...documentAssessmentResult,
    },
    riskAssessmentResult: {
      ...riskAssessmentResult,
    },
    testResult: {
      ...testResult,
    },
    impactRating: {
      ...impactRating,
    },
  },
} as const satisfies QueryConfig<'assessment_result_parent'>;

export const getAssessmentResultParentWithDocumentResultsQueryConfig = {
  columns: {
    Id: true,
    ParentId: true,
    ResultType: true,
    ParentType: true,
  },
  with: {
    documentAssessmentResult: {
      ...documentAssessmentResult,
      with: {
        parents: {
          columns: {
            ParentId: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'assessment_result_parent'>;

export const getAssessmentResultParentWithObligationResultsQueryConfig = {
  columns: {
    Id: true,
    ParentId: true,
    ResultType: true,
    ParentType: true,
    CreatedAtTimestamp: true,
  },
  with: {
    obligationAssessmentResult: {
      ...obligationAssessmentResult,
      with: {
        parents: {
          columns: {
            ParentId: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'assessment_result_parent'>;

export const getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledQueryConfig =
  {
    ...riskControlledSecondLineResult,
    with: {
      ...ancestorContributors,
      parents: {
        where: {
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        },
        columns: {},
        with: {
          complianceMonitoringAssessment: {
            ...complianceMonitoringAssessment,
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
  } as const satisfies QueryConfig<'risk_controlled_second_line_result'>;

export const getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledQueryConfig =
  {
    ...riskUncontrolledSecondLineResult,
    with: {
      ...ancestorContributors,
      parents: {
        where: {
          ParentType: ParentTypes.ComplianceMonitoringAssessment,
        },
        columns: {},
        with: {
          complianceMonitoringAssessment: {
            ...complianceMonitoringAssessment,
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
  } as const satisfies QueryConfig<'risk_uncontrolled_second_line_result'>;

export const getInternalAuditReportRiskAssessmentResultsByRiskIdControlledQueryConfig =
  {
    ...riskControlledInternalAuditResult,
    with: {
      ...ancestorContributors,
      parents: {
        where: {
          ParentType: ParentTypes.InternalAuditReport,
        },
        columns: {},
        with: {
          internalAuditReport: {
            ...internalAuditReport,
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
  } as const satisfies QueryConfig<'risk_controlled_internal_audit_result'>;

export const getInternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledQueryConfig =
  {
    ...riskUncontrolledInternalAuditResult,
    with: {
      ...ancestorContributors,
      parents: {
        where: {
          ParentType: ParentTypes.InternalAuditReport,
        },
        columns: {},
        with: {
          internalAuditReport: {
            ...internalAuditReport,
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
  } as const satisfies QueryConfig<'risk_uncontrolled_internal_audit_result'>;

export const getLatestDocumentAssessmentResultByDocumentIdQueryConfig = {
  ...documentAssessmentResult,
  with: {
    ...ancestorContributors,
    parents: {
      where: {
        ParentType: ParentTypes.Assessment,
      },
      columns: {},
      with: {
        assessment: {
          ...assessment,
        },
      },
    },
  },
} as const satisfies QueryConfig<'document_assessment_result'>;

export const getDocumentAssessmentResultsByParentIdQueryConfig = {
  ...documentAssessmentResult,
  with: {
    files: {
      columns: {
        ParentId: true,
        ChangeRequestFileOperation: true,
      },
      with: {
        file: true,
      },
    },
    parents: {
      where: {
        ParentType: ParentTypes.Assessment,
      },
      columns: {},
      with: {
        assessment: {
          ...assessment,
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
} as const satisfies QueryConfig<'document_assessment_result'>;
