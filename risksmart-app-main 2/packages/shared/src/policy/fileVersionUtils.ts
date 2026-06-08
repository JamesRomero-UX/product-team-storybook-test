import lodash from 'lodash';

export const nextFileVersion = (
  previousVersion: string | undefined
): string => {
  if (!previousVersion) {
    return '0.1';
  }
  const previousVersionFloat = Number.parseFloat(previousVersion);
  if (isNaN(previousVersionFloat)) {
    return '';
  }

  return lodash.round(previousVersionFloat + 0.1, 2).toString();
};
