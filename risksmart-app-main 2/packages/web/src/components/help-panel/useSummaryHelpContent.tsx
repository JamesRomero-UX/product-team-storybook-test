import type { ParseKeys } from 'i18next';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { contentToHtml } from './convertHtmlContentToHtml';
import { HelpContentSchema } from './helpContentSchema';
import type { HelpContent } from './useHelpStore';
import { useHelpStore } from './useHelpStore';

const useSummaryHelpContent = (
  translationKey: ParseKeys<'common'>,
  summaryHelpContent: HelpContent
) => {
  const { setSummaryHelpContent, setTranslationKey } = useHelpStore();

  useEffect(() => {
    setSummaryHelpContent(summaryHelpContent);
    setTranslationKey(translationKey);

    return () => {
      setSummaryHelpContent([]);
      setTranslationKey('');
    };

    //   eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSummaryHelpContent, setTranslationKey, translationKey]);
};

export const useI18NSummaryHelpContent = (
  translationKey: ParseKeys<'common'>
) => {
  const { t } = useTranslation('common');
  const summaryHelpContent = useMemo(
    () => t(translationKey),
    [translationKey, t]
  );

  const data = useMemo<HelpContent>(() => {
    // Check if translation is not set (or set to null)
    if (!summaryHelpContent) {
      console.error(`No help content found for: ${translationKey}`);

      return [];
    }

    if (summaryHelpContent === translationKey) {
      console.error(
        `summaryHelpContent matches translationKey: ${translationKey}`
      );

      return [];
    }

    const result = HelpContentSchema.safeParse(summaryHelpContent);

    if (!result.success) {
      console.error(`Help content not in correct format: ${translationKey}`);

      return [];
    }

    return result.data.map((r) => ({
      title: r.title,
      content: contentToHtml(r.content),
    }));

    // Should always get same content for a translations key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationKey, t]);

  return useSummaryHelpContent(translationKey, data);
};
