import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'silent';
process.env.PACKAGE_VERSION = '1.0.0';
process.env.AUTH_CONFIG =
  '{"clientType": "mock","tokenUrl": "http://localhost:3232/token"}';
process.env.JWK_LOCAL_KEYS =
  '[{"kty":"RSA","n":"0c3888OmR3NboYD2ukTNF4-NhLMOVisB1BlLGEcnAe8xq1FSx1Vo2lGXnJTmMP8qEFgTqNA09VwxEsTbw6MOylTpAMp9fEX6_3F5ZzJ0FdnhtGf9UHEbIoNRHI0iBS60uYhKVVYCnSsuvzyVtV7II6S_ql7TsmRsj-0J7dsw7dngAAbQl83QiLtNwZm7DpSovzfWK8MG2dTyOwrITG2gTmTNfZa9EzOQRiM0QiYzHcsGW2vQqp6BtVhbkc08Yj4RmH1IE6G1PC3K9q-oEgB6RG26lARNT9Di56-jW6-Z_aj5V6cS0Gbd5_qPxR9Ad-zavqXimIgS8eGT3IywNwnN0w","e":"AQAB","kid":"c22d107e8513f1d42a0f6835815fd8823809a7d346052c3dd4a88829c47567bc07542d84fa6067d8","alg":"RS256"}]';
process.env.DATA_CLIENT_TYPE = 'mock';
process.env.ORG_CLIENT_LIMIT = '20';
process.env.MOCK_EXISTING_CLIENT_COUNT = '2';
process.env.AUTH_JWT_PROVIDERS =
  '[{"alg":"RS256","jwkUri": "http://localhost:3232/jwks", "issuer":"http://localhost:3232"}]';
process.env.ALLOWED_RS_USER_ROLES = '["RiskManager"]';
process.env.API_DOCS_SIGNING_KEY =
  'zpMA8o25TnpVKnK+i3RSjmWPEgjhSdmOP1AP8RBTOaFbbAHq6agUqu7F5VqJ294Narlb7FzQL4TfUnswnly61A';
process.env.API_DOCS_EXPIRY_HRS = '24';
process.env.ENABLE_RATE_LIMITER = 'false';
process.env.ENABLE_TRUST_PROXY = 'false';
process.env.HASURA_ENDPOINT = 'http://localhost:8080/gaphql';
process.env.HASURA_ADMIN_SECRET = 'abcdef';
process.env.APP_DOMAIN = 'some-risksmart-domain.com';
// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
