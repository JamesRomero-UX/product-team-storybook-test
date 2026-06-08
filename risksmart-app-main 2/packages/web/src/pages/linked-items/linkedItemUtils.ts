import { t } from 'i18next';

export const getUnlinkFriendlyErrorMessage = (errorMessage: string): string => {
  // @TODO: this is temporary, remove once we've implemented supported for all object types
  const types = errorMessage.match(/(?<=\{).*?(?=\})/g);
  if (types && types?.length >= 2) {
    const sourceType = t(
      // @ts-ignore
      `${types[0]}_other`
    );
    const targetType = t(
      // @ts-ignore
      `${types[1]}_other`
    );

    // TODO: Translation
    return `Removing links between ${sourceType} and ${targetType} is not supported.`;
  } else {
    // TODO: Translation
    return 'Failed to remove links';
  }
};
