import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getOrgId } from 'src/requestHelpers';
import { z } from 'zod';

import { getTaskStatus } from './services/hybiscusService';
import { signTaskToken, verifyTaskToken } from './token';

export const handler = frontendApiHandler(z.any(), async (_body, evt) => {
  const taskId = evt.pathParameters?.['taskId'];

  if (!taskId) {
    throw new BadRequest('taskId not found in path');
  }

  // Validate token (sig + exp) bound to orgKey + taskId
  const orgKey = getOrgId(evt);
  const qs = evt.queryStringParameters || {};
  const sig = qs['sig'];
  const exp = qs['exp'];
  const isValid = verifyTaskToken({ taskId, orgKey, sig, exp });
  if (!isValid) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        success: false,
        error: 'Invalid or expired token',
      }),
    };
  }

  const statusResult = await getTaskStatus(taskId, {
    waitForCompletion: true,
  });

  if (statusResult.status === 'SUCCESS') {
    // Build a proxy download URL from this same API so we can control the filename via Content-Disposition.
    // Compute scheme/host and include stage prefix for execute-api hosts.
    const hostHeader =
      evt.headers?.['x-forwarded-host'] ||
      evt.headers?.['host'] ||
      evt.requestContext.domainName;
    const protoHeader = (
      evt.headers?.['x-forwarded-proto'] ?? 'https'
    ).toString();
    const proto = (protoHeader.split(',').shift() || 'https').trim();
    const stage = evt.requestContext.stage;

    const isExecuteApi = hostHeader?.includes('amazonaws.com');
    const stagePrefix =
      isExecuteApi && stage && stage !== '$default' ? `/${stage}` : '';

    // Prefer filename from query string (client-provided), with a safe fallback
    const requestedFilename = qs['filename'];
    const filename =
      (requestedFilename && requestedFilename.trim()) || `report-${taskId}.pdf`;
    // Mint a fresh short-lived token for the download step
    const fresh = signTaskToken(taskId, orgKey);
    const proxyPath = `${stagePrefix}/pdf/download/${taskId}?filename=${encodeURIComponent(
      filename
    )}&sig=${encodeURIComponent(fresh.sig)}&exp=${fresh.exp}`;
    const proxyUrl = `${proto}://${hostHeader}${proxyPath}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status: statusResult.status,
        // Prefer our proxy URL to enforce a friendly filename across browsers
        downloadUrl: proxyUrl,
        contentType: 'application/pdf',
        filename,
      }),
    };
  } else if (statusResult.status === 'FAILED') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        status: statusResult.status,
        error: statusResult.errorMessage || 'PDF generation failed',
      }),
    };
  } else {
    // Still processing
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        status: statusResult.status,
      }),
    };
  }
});
