import dotenv from 'dotenv';
import path from 'path';
import { vi } from 'vitest';

dotenv.config({
  path: [
    path.resolve(process.cwd(), '.env.test'),
    path.resolve(process.cwd(), '.env'),
  ],
  quiet: true,
});

// Mock AWS Lambda Powertools Logger to suppress structured logging output
vi.mock('@aws-lambda-powertools/logger', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));
