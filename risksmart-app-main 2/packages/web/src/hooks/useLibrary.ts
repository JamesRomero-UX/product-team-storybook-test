import type { Obligation_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type LibraryKeys =
  | 'causes'
  | 'consequences'
  | 'controls'
  | 'obligations'
  | 'risks';

export type LibraryItem = {
  title: string;
  description: string;
  tier?: number;
  type?: Obligation_Type_Enum;
};

export type Library = {
  [key in LibraryKeys]: LibraryItem[];
};

const isLibraryItem = (item: unknown): item is LibraryItem[] => {
  if ((item as LibraryItem[])[0]?.title) {
    return true;
  }

  return false;
};

export function useLibrary(library: LibraryKeys) {
  const { t } = useTranslation('library');

  return useMemo(() => {
    const items = t(library, {
      returnObjects: true,
    });

    return isLibraryItem(items) ? items : [];
  }, [t, library]);
}
