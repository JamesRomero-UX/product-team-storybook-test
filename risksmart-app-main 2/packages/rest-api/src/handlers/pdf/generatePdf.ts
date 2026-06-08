import frontendApiHandler from 'src/frontendApiHandler';
import { getLogger } from 'src/logger';
import { getOrgId, getTenantNameFromClaims } from 'src/requestHelpers';
import { z } from 'zod';

import { generatePdfWithHybiscus } from './services/hybiscusService';
import { getPdfTemplate } from './templates/templateRegistry';
import { signTaskToken } from './token';
import type { PdfTemplateId } from './types';

const logger = getLogger();

const GeneratePdfSchema = z.object({
  templateId: z.string(),
  data: z.record(z.unknown()),
  options: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    filename: z.string(),
    orientation: z.enum(['landscape', 'portrait']).optional(),
  }),
});

// Support legacy Hasura Action shape: { input: { ...fields } }
const InboundSchema = z.union([
  GeneratePdfSchema,
  z
    .object({
      input: GeneratePdfSchema,
    })
    .passthrough(),
]);

type Inbound = z.infer<typeof InboundSchema>;

export const handler = frontendApiHandler(InboundSchema, async (body, evt) => {
  const normalized: z.infer<typeof GeneratePdfSchema> =
    'templateId' in (body as Inbound)
      ? (body as z.infer<typeof GeneratePdfSchema>)
      : (body as { input: z.infer<typeof GeneratePdfSchema> }).input;

  const { templateId, data, options } = normalized;
  const tenant = getTenantNameFromClaims(evt);
  const orgKey = getOrgId(evt);

  const template = getPdfTemplate(templateId as PdfTemplateId);
  if (!template) {
    logger.error('Template not found', { templateId });
    throw new Error(`Template not found: ${templateId}`);
  }

  const hybiscusOptions = {
    title: options?.title,
    subtitle: options?.subtitle,
    filename: options?.filename,
    orientation: options?.orientation,
  };

  const pdfResult = await generatePdfWithHybiscus({
    template,
    data,
    options: hybiscusOptions,
    context: {
      tenant,
      orgKey,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      taskId: pdfResult.taskId,
      status: pdfResult.status,
      token: signTaskToken(pdfResult.taskId, orgKey),
    }),
  };
});
