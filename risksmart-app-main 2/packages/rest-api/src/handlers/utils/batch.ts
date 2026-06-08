export const chunk = <T>(arr: T[], size = 10): T[][] => {
  return arr.reduce((acc, _, index) => {
    if (index % size === 0) {
      return [...acc, arr.slice(index, index + size)];
    }

    return acc;
  }, [] as T[][]);
};
