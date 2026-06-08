export const toSingleCell = (items: { label: string }[]) => {
  return items
    .map((u) => u.label)
    .sort((a, b) => a.localeCompare(b))
    .join(', ');
};
