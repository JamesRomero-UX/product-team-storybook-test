import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import type { QueryConfig } from '../db';
import { internalAuditReport } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  tagsAndDepartments,
} from './utils';

export const getInternalAuditReportRegisterQueryConfig = {
  ...internalAuditReport,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    assessmentResults: {
      columns: {
        ParentId: true,
      },
      with: {
        controlledRiskAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              columns: {
                OrgKey: false,
              },
              with: {
                risk: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
        uncontrolledRiskAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              columns: {
                OrgKey: false,
              },
              with: {
                risk: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
        obligationAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              columns: {
                ParentId: true,
              },
              with: {
                obligation: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
        documentAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              columns: {
                ParentId: true,
              },
              with: {
                document: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'internal_audit_report'>;

export const getInternalAuditReportByOriginatingItemIdQueryConfig = {
  ...internalAuditReport,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...ancestorContributors,
    completedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    assessmentResults: {
      columns: {
        ParentId: true,
      },
      with: {
        controlledRiskAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              where: { ParentType: ParentTypes.Risk },
              columns: {},
              with: {
                risk: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
        uncontrolledRiskAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              where: { ParentType: ParentTypes.Risk },
              columns: {},
              with: {
                risk: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
        obligationAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              where: { ParentType: ParentTypes.Obligation },
              columns: {},
              with: {
                obligation: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
        documentAssessmentResult: {
          columns: {
            Id: true,
          },
          with: {
            parents: {
              where: { ParentType: ParentTypes.Document },
              columns: {},
              with: {
                document: {
                  columns: {
                    Id: true,
                    Title: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'internal_audit_report'>;

export const getInternalAuditReportByIdQueryConfig = {
  ...internalAuditReport,
  with: {
    ...ownersAndContributors,
    ...ancestorContributors,
    ...tagsAndDepartments,
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'internal_audit_report'>;
