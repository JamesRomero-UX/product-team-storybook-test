export type DatePrecision = 'day' | 'month' | 'year';

export type ReportRawDataType = null | number | string | string[];

export type ReportField = {
  value: ReportRawDataType;
  meta?: Record<string, string>;
};

export type Series = {
  title: unknown;
  color?: string;
  hasSubcategory?: boolean;
  data: {
    x: unknown;
    label: string;
    y: unknown;
    color?: string;
  }[];
};
