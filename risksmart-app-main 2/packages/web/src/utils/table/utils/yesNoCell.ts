import { EMPTY_CELL } from '@/utils/collectionUtils';

export const yesNoCell = <T>(key: keyof T) => {
  return (item: T) => {
    if (item[key] === null) {
      return EMPTY_CELL;
    }

    // TODO: translations
    return item[key] ? 'Yes' : 'No';
  };
};
