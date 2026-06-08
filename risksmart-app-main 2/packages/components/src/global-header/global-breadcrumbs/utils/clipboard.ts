import { handleError } from '../../../utils/errorUtils';

interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard with error handling
 */
const copyToClipboard = async (text: string): Promise<ClipboardResult> => {
  try {
    await navigator.clipboard.writeText(text);

    return { success: true };
  } catch (error) {
    handleError(error, { extra: { text } }, 'clipboard-copy-error');

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Copy current page URL to clipboard
 */
export const copyCurrentPageUrl = async (): Promise<ClipboardResult> => {
  return copyToClipboard(window.location.href);
};
