import dayjs from 'dayjs';

export const getAuditItems = <T extends { ModifiedAtTimestamp: string }>(
  items: T[] | undefined,
  operationDate: string
) => {
  const operationDateObj = dayjs(operationDate);

  const current = items?.find((c) =>
    dayjs(c.ModifiedAtTimestamp).isSame(operationDateObj)
  );
  const previous = items
    ?.filter((c) => dayjs(c.ModifiedAtTimestamp).isBefore(operationDateObj))
    .sort(
      (a, b) =>
        dayjs(b.ModifiedAtTimestamp).valueOf() -
        dayjs(a.ModifiedAtTimestamp).valueOf()
    )[0];

  return {
    current,
    previous,
  };
};
