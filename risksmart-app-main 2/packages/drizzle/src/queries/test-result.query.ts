import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import type { QueryConfig } from '../db';
import {
  assessment,
  complianceMonitoringAssessment,
  internalAuditReport,
  testResult,
} from './fragments/index';
import { relationFiles, tagsAndDepartments } from './utils';

export const getTestResultsQueryConfig = {
  ...testResult,
  with: {
    submitter: {
      columns: {
        FriendlyName: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    files: {
      columns: {
        ParentId: true,
      },
    },
    parent: {
      columns: {
        Title: true,
        SequentialId: true,
        Id: true,
      },
      with: {
        ...tagsAndDepartments,
        schedule: {
          columns: {
            ManualDueDate: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'test_result'>;

export const getTestResultByIdQueryConfig = {
  ...testResult,
  with: {
    ...relationFiles,
  },
} as const satisfies QueryConfig<'test_result'>;

export const getTestResultsByControlIdQueryConfig = {
  ...testResult,
  with: {
    submitter: {
      columns: {
        FriendlyName: true,
      },
    },
    ...relationFiles,
    assessmentParents: {
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
} as const satisfies QueryConfig<'test_result'>;

export const getInternalAuditReportTestResultsByControlIdQueryConfig = {
  ...testResult,
  with: {
    submitter: {
      columns: {
        FriendlyName: true,
      },
    },
    ...relationFiles,
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
} as const satisfies QueryConfig<'control_test_internal_audit_result'>;

export const getComplianceMonitoringAssessmentTestResultsByControlIdQueryConfig =
  {
    ...testResult,
    with: {
      submitter: {
        columns: {
          FriendlyName: true,
        },
      },
      ...relationFiles,
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
  } as const satisfies QueryConfig<'control_test_second_line_result'>;
