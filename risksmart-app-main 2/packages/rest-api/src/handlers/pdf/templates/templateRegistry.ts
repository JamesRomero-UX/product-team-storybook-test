import type { PdfTemplate, PdfTemplateId } from '../types';
import { defaultRegisterTemplate } from './defaultRegisterTemplate';

const templates: Record<PdfTemplateId, PdfTemplate> = {
  'default-register': defaultRegisterTemplate,
};

export function getPdfTemplate(templateId: PdfTemplateId): PdfTemplate | null {
  return templates[templateId] || null;
}

export function getAllTemplates(): PdfTemplate[] {
  return Object.values(templates);
}

export function getTemplateIds(): PdfTemplateId[] {
  return Object.keys(templates) as PdfTemplateId[];
}
