import type { Report } from '@hybiscus/api';

// PDF Template Types
export type PdfTemplateId = 'default-register';

export interface PdfGenerationOptions {
  title: string;
  subtitle?: string;
  filename: string;
  orientation?: 'landscape' | 'portrait';
}

export interface PdfTemplateContext {
  tenant: string;
  orgKey: string;
}

export interface PdfTemplate {
  id: PdfTemplateId;
  buildConfig: (params: {
    data: Record<string, unknown>;
    options: PdfGenerationOptions;
    context: PdfTemplateContext;
  }) => Promise<Report>;
}

// Filter Token Types
export interface FilterToken {
  property: string;
  operator: string;
  value: string;
  operation?: 'and' | 'or'; // The operation that connects this token to the next
}

// Table Export Types
export interface TableExportData {
  entityLabel: string;
  headers: string[];
  rows: (string | number)[][];
  // Optional relative column widths (sum ~= 1) matching headers order
  columnWidthRatios?: number[];
  // Optional matrix of per-cell styles aligned with rows
  cellStyles?: Array<
    Array<
      | null
      | undefined
      | {
          backgroundColor?: string;
          color?: string;
        }
    >
  >;
  metadata?: {
    totalCount?: number;
    filteredCount?: number;
    exportedAt?: string;
    hasFilters?: boolean;
    filterInfo?: string;
    appliedFilters?: FilterToken[];
    filters?: Record<string, unknown>;
    filterPropertyLabels?: Record<string, string>;
  };
}

// Register Export Types
export interface DefaultRegisterExportData extends TableExportData {
  ribbonData?: {
    cards: DefaultRegisterCard[];
  };
}

export interface DefaultRegisterCard {
  title: string;
  value: string | number;
  filterQuery?: Record<string, unknown>;
  highlighted?: boolean;
}
