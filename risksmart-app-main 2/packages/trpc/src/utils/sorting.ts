export const sortByDateDesc = <T extends Record<string, unknown>>(
  a: T | null | undefined,
  b: T | null | undefined,
  dateKey: keyof T,
  timestampKey: keyof T
) => {
  const aDate = a?.[dateKey] as string | undefined;
  const bDate = b?.[dateKey] as string | undefined;
  const aTimestamp = a?.[timestampKey] as string | undefined;
  const bTimestamp = b?.[timestampKey] as string | undefined;

  const aTime = aDate ? new Date(aDate).getTime() : NaN;
  const bTime = bDate ? new Date(bDate).getTime() : NaN;
  const aDateValid = !isNaN(aTime);
  const bDateValid = !isNaN(bTime);

  if (aDateValid && bDateValid) {
    const dateCompare = bTime - aTime;
    if (dateCompare !== 0) {
      return dateCompare;
    }
  } else if (aDateValid && !bDateValid) {
    return -1;
  } else if (!aDateValid && bDateValid) {
    return 1;
  }

  const aTsTime = aTimestamp ? new Date(aTimestamp).getTime() : NaN;
  const bTsTime = bTimestamp ? new Date(bTimestamp).getTime() : NaN;
  const aTimestampValid = !isNaN(aTsTime);
  const bTimestampValid = !isNaN(bTsTime);

  if (aTimestampValid && bTimestampValid) {
    return bTsTime - aTsTime;
  } else if (aTimestampValid && !bTimestampValid) {
    return -1;
  } else if (!aTimestampValid && bTimestampValid) {
    return 1;
  }

  return 0;
};
