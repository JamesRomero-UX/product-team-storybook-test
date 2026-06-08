import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// adds openapi generator to zod.
extendZodWithOpenApi(z);

export { z };
