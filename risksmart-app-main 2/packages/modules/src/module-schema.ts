import { z } from 'zod';

import type { Module, ModuleConfig } from './types';

/**
 * One module node:
 * - required: enabled: boolean
 * - optional: allowTabConfig: boolean
 * - optional: subModules: record of more module nodes
 * - "config" (or any other extra fields) are allowed via .passthrough()
 */
const ModuleSchema: z.ZodType<Module> = z.lazy(() =>
  z
    .object({
      enabled: z.boolean(),
      allowTabConfig: z.boolean().optional(),
      config: z.record(z.unknown()).optional(),
      subModules: z.record(ModuleSchema).optional(),
    })
    .passthrough()
);

/**
 * Root schema: top-level object where each key is a module.
 * e.g. ai, risk, issue, action, ...
 */
export const moduleConfigSchema: z.ZodType<ModuleConfig> =
  z.record(ModuleSchema);
