import type { Match } from '@risksmart-app/components/src/breadcrumbs/types';
import { useLocation, useMatches } from 'react-router';

export const useGetDetailParentPath = (
  id: string,
  allowUndefined?: boolean
) => {
  return useGetDetailAncestorPath(id, 1, allowUndefined);
};

export const useGetDetailPath = (id: string, allowUndefined?: boolean) => {
  return useGetDetailAncestorPath(id, 0, allowUndefined);
};

const useGetDetailAncestorPath = (
  id: string,
  ancestorDepth: number,
  allowUndefined?: boolean
) => {
  const location = useLocation();
  const matches = useMatches().filter((m) => !(m.handle as Match)?.isNotParent);
  const detailMatchIndex = matches.findIndex((m) => m.pathname.endsWith(id));
  const match: Match = matches[detailMatchIndex - ancestorDepth] as Match;
  if (match?.handle?.breadcrumbUrl) {
    return match.handle.breadcrumbUrl({
      match,
      location,
    });
  }
  if (!allowUndefined && !match) {
    throw new Error('Failed to find ID match');
  }

  return match?.pathname;
};
