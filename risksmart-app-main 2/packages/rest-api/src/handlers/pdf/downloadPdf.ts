import axios from 'axios';
import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getOrgId } from 'src/requestHelpers';
import { z } from 'zod';

import { getReport } from './services/hybiscusService';
import { verifyTaskToken } from './token';

// Streams a generated PDF via our API with a proper filename
export const handler = frontendApiHandler(z.any(), async (_body, evt) => {
  const taskId = evt.pathParameters?.['taskId'];
  if (!taskId) {
    throw new BadRequest('taskId not found in path');
  }

  // Accept filename from query param (since we don't persist it long-term server-side)
  const qs = evt.queryStringParameters || {};
  // Verify token bound to orgKey + taskId
  const orgKey = getOrgId(evt);
  const sig = qs['sig'];
  const exp = qs['exp'];
  const ok = verifyTaskToken({ taskId, orgKey, sig, exp });
  if (!ok) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        success: false,
        error: 'Invalid or expired token',
      }),
    };
  }

  const requestedFilename = qs['filename'];

  // Sensible fallback to avoid ugly default names
  const safeFallback = `report-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
  // Basic sanitization: strip path separators, quotes and restrict to safe charset
  const rawName = (requestedFilename || safeFallback)
    .replace(/[\\/]/g, '-')
    .replace(/"/g, '')
    .replace(/[^A-Za-z0-9._ -]/g, '');
  const trimmed = rawName.trim().slice(0, 150);
  const filename = trimmed.toLowerCase().endsWith('.pdf')
    ? trimmed
    : `${trimmed}.pdf`;

  const { downloadUrl } = await getReport(taskId);

  const response = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
  });
  const pdfBuffer: Buffer = Buffer.from(response.data);
  const base64Body = pdfBuffer.toString('base64');

  // Use both filename and RFC 5987 filename* for better browser support
  const contentDisposition = `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
    filename
  )}`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition,
      'Cache-Control': 'no-store',
    },
    isBase64Encoded: true,
    body: base64Body,
  };
});
