type LibraryKeys =
  | 'consequences'
  | 'obligations'
  | 'controls'
  | 'risks'
  | 'causes';

export interface LibraryItem {
  title: string;
  description: string;
  tier?: number;
  type?: string;
}

export type Library = {
  [key in LibraryKeys]: LibraryItem[];
};
