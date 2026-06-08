import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getTestResults = () =>
  ({
    supportedLatest: true,
    hasAccess: () => true,
    objectType: ParentTypes.TestResult,
    label: 'Test Results',
    customAttributeFormConfigurationParentTypes: [ParentTypes.TestResult],
    fields: {
      ...getAuditColumns(),
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'TR-',
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'test_result',
          fieldId: 'Title',
        },
      },
      designEffectiveness: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'design_effectiveness',
        formConfig: {
          formId: 'test_result',
          fieldId: 'DesignEffectiveness',
        },
      },
      performanceEffectiveness: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'performance_effectiveness',
        formConfig: {
          formId: 'test_result',
          fieldId: 'PerformanceEffectiveness',
        },
      },
      testResult: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'effectiveness',
        formConfig: {
          formId: 'test_result',
          fieldId: 'OverallEffectiveness',
        },
      },
      details: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'test_result',
          fieldId: 'Description',
        },
      },
      performedById: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: 'Performed by Id',
      },
      performedByFriendlyName: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'test_result',
          fieldId: 'Submitter',
        },
      },
      testDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'test_result',
          fieldId: 'TestDate',
        },
      },
      typeType: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'testTypes',
        formConfig: {
          formId: 'test_result',
          fieldId: 'TestType',
        },
      },
    },
  }) as const satisfies SharedDataset;
