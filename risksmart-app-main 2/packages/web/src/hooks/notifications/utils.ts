import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Maps a Knock workflow key prefix to a taxonomy translation key.
 * Returns undefined if no match is found.
 */
const getTaxonomyKey = (workflowKey: string): string | undefined => {
  if (workflowKey.startsWith('risk-')) {
    return 'risk';
  }
  if (workflowKey.startsWith('action-')) {
    return 'action';
  }
  if (workflowKey.startsWith('control-')) {
    return 'control';
  }
  if (
    workflowKey.startsWith('attestation-') ||
    workflowKey === 'policy-attestation-reminder'
  ) {
    return 'attestation';
  }
  if (
    workflowKey.startsWith('document-') ||
    workflowKey.startsWith('policy-')
  ) {
    return 'document';
  }
  if (workflowKey.startsWith('issue-')) {
    return 'issue';
  }
  if (workflowKey.startsWith('indicator-')) {
    return 'indicator';
  }
  if (workflowKey.startsWith('third-party-')) {
    return 'third_party';
  }
  if (workflowKey.startsWith('change-request-')) {
    return 'request';
  }

  return undefined;
};

type TranslationFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * Maps a Knock workflow key prefix to a human-readable object type label
 * using customer-configurable taxonomy translations.
 */
export const mapWorkflowKeyToObjectType = (
  workflowKey: string,
  t?: TranslationFn
): string => {
  const taxonomyKey = getTaxonomyKey(workflowKey);

  if (taxonomyKey && t) {
    const label = t(taxonomyKey, { count: 1 });

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  if (workflowKey === 'digest') {
    return 'Digest';
  }

  // Fallback for unknown workflows or when no translation function provided
  if (taxonomyKey) {
    return taxonomyKey
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return 'Other';
};

/**
 * Hook that returns a mapper function using customer taxonomy translations.
 */
export const useObjectTypeMapper = (): ((workflowKey: string) => string) => {
  const { t } = useTranslation('taxonomy');
  const tFn: TranslationFn = t as TranslationFn;

  return useMemo(() => {
    const mapper = (workflowKey: string): string =>
      mapWorkflowKeyToObjectType(workflowKey, tFn);

    return mapper;
  }, [tFn]);
};
