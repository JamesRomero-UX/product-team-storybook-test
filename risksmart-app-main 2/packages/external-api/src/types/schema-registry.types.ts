import type { z } from 'zod';

import type { Compat } from './versioning';

// Type of schema being versioned
export type SchemaType =
  | 'response' // Response body schemas
  | 'request' // Request body schemas (future)
  | 'query' // Query parameter schemas (future)
  | 'params' // Path parameter schemas (future)
  | 'error' // Error response schemas
  | 'webhook'; // Webhook payload schemas (future)

// Generic schema version definition that works for any schema type.
export interface SchemaVersionDefinition<
  TSchemaType extends SchemaType = SchemaType,
> {
  version: Compat;
  schemaType: TSchemaType;
  description: string;
  outputSchema: z.ZodType;
  transformFromPrevious: z.ZodType;
  changes: VersionChangeEntry[];
}

export interface VersionChangeEntry {
  type: 'breaking' | 'feature' | 'fix' | 'deprecation';
  description: string;
  fields?: string[];
  // Impact area - helps categorize what part of the API is affected
  impact?: 'request' | 'response' | 'error' | 'validation';
}

//  Latest schema definition (unversioned, always current)
export interface LatestSchemaDefinition<
  TSchemaType extends SchemaType = SchemaType,
> {
  schemaType: TSchemaType;
  schema: z.ZodType;
  description: string;
  version: 'latest';
}

// Complete resource schema registry including all schema types
export interface ResourceSchemaRegistry {
  resourceName: string;

  // Response schemas (what we return)
  response?: {
    latest: LatestSchemaDefinition<'response'>;
    versions: Record<Compat, SchemaVersionDefinition<'response'>>;
  };

  // Request schemas (input schemas) - placeholder for future
  request?: {
    latest: LatestSchemaDefinition<'request'>;
    versions: Record<Compat, SchemaVersionDefinition<'request'>>;
  };

  // Query parameter schemas - placeholder for future
  query?: {
    latest: LatestSchemaDefinition<'query'>;
    versions: Record<Compat, SchemaVersionDefinition<'query'>>;
  };

  // Error schemas - placeholder for future
  error?: {
    latest: LatestSchemaDefinition<'error'>;
    versions: Record<Compat, SchemaVersionDefinition<'error'>>;
  };
}
