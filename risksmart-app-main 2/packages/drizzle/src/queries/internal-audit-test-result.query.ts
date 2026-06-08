import type { QueryConfig } from '../db';
import { controlTestInternalAuditResult } from './fragments/index';
import { relationFiles } from './utils';

export const getInternalAuditTestResultByIdQueryConfig = {
  ...controlTestInternalAuditResult,
  with: {
    ...relationFiles,
  },
} as const satisfies QueryConfig<'control_test_internal_audit_result'>;
