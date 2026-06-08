import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getAttestationCycleFormConfig = () => {
  return {
    requireAttestationFromEveryone: {
      fieldId: 'requireAttestationFromEveryone',
      formLabel: i18n.t('policy.fields.AttestationTarget'),
      allowAsConditionSource: true,
    },
    attestationGroups: {
      fieldId: 'attestationGroups',
      formLabel: i18n.t('policy.fields.AttestationGroups'),
      allowTargetConditions: true,
    },
    requireReattestation: {
      fieldId: 'requireReattestation',
      formLabel: i18n.t('policy.fields.AttestationReissue'),
      allowAsConditionSource: true,
    },
    attestationTimeLimit: {
      fieldId: 'attestationTimeLimit',
      formLabel: i18n.t('policy.fields.AttestationTimeLimit'),
      allowAsConditionSource: true,
    },
    attestationPromptText: {
      fieldId: 'attestationPromptText',
      formLabel: i18n.t('policy.fields.AttestationPromptText'),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
