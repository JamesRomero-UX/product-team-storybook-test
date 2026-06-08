#!/usr/bin/env tsx
/**
 * Generates TypeScript types from the OpenAPI spec.
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-openapi-types.ts
 *
 * The output file (src/generated/openapi.d.ts) should be committed to version
 * control — it acts as a typed contract for API consumers (zapier-app, etc.).
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';

import { generateOpenApiDocument } from '../src/schemas/openapi.schema.js';
import { CURRENT_API_VERSION } from '../src/versions/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(
  __dirname,
  '..',
  'src',
  'generated',
  'openapi.d.ts'
);

async function main() {
  const doc = generateOpenApiDocument(
    CURRENT_API_VERSION,
    'https://api.risksmart.com'
  );

  const ast = await openapiTS(doc as never);
  const contents = astToString(ast);

  const header = [
    '/* eslint-disable */',
    '/* prettier-ignore */',
    '/**',
    ' * This file was auto-generated from the OpenAPI spec.',
    ' * Do not make direct changes to the file.',
    ' *',
    ` * API version: ${CURRENT_API_VERSION}`,
    ` * Generated at: ${new Date().toISOString()}`,
    ' */',
    '',
  ].join('\n');

  writeFileSync(outputPath, header + contents, 'utf-8');
  process.stdout.write(`Types written to ${outputPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`Failed to generate OpenAPI types: ${String(err)}\n`);
  process.exit(1);
});
