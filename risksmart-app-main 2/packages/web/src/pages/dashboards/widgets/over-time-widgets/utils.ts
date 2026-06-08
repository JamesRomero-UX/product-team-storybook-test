export const sortByDateX = <T extends { x: string }>(a: T, b: T) =>
  new Date(a.x).getTime() - new Date(b.x).getTime();
