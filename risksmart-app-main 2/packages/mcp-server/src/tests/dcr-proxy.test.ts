import { describe, expect, it } from 'vitest';

import { validateRedirectUris } from '../auth/dcr-proxy';

describe('DCR redirect URI validation', () => {
  it('allows Claude AI callback', () => {
    expect(
      validateRedirectUris(['https://claude.ai/api/mcp/auth_callback'])
    ).toBe(true);
  });

  it('allows ChatGPT callback', () => {
    expect(
      validateRedirectUris([
        'https://chatgpt.com/connector_platform_oauth_redirect',
      ])
    ).toBe(true);
  });

  it('allows localhost with port and /callback path', () => {
    expect(validateRedirectUris(['http://localhost:3000/callback'])).toBe(true);
  });

  it('allows localhost with /oauth/callback path', () => {
    expect(validateRedirectUris(['http://localhost:3000/oauth/callback'])).toBe(
      true
    );
  });

  it('allows 127.0.0.1 with port and /callback path', () => {
    expect(validateRedirectUris(['http://127.0.0.1:8080/callback'])).toBe(true);
  });

  it('allows VS Code redirect', () => {
    expect(validateRedirectUris(['https://vscode.dev/redirect'])).toBe(true);
  });

  it('allows VS Code Insiders redirect', () => {
    expect(validateRedirectUris(['https://insiders.vscode.dev/redirect'])).toBe(
      true
    );
  });

  it('rejects arbitrary URLs', () => {
    expect(validateRedirectUris(['https://evil.example.com/callback'])).toBe(
      false
    );
  });

  it('rejects when one URI is invalid', () => {
    expect(
      validateRedirectUris([
        'https://claude.ai/api/mcp/auth_callback',
        'https://evil.example.com/callback',
      ])
    ).toBe(false);
  });

  it('allows multiple valid URIs', () => {
    expect(
      validateRedirectUris([
        'https://claude.ai/api/mcp/auth_callback',
        'http://localhost:3000/callback',
      ])
    ).toBe(true);
  });

  it('rejects empty array', () => {
    expect(validateRedirectUris([])).toBe(false);
  });

  it('rejects localhost with arbitrary paths', () => {
    expect(validateRedirectUris(['http://localhost:3000/evil/path'])).toBe(
      false
    );
  });

  it('rejects localhost without a path', () => {
    expect(validateRedirectUris(['http://localhost:3000'])).toBe(false);
  });

  it('allows Zapier MCP Client redirect', () => {
    expect(
      validateRedirectUris(['https://actions.zapier.com/oauth/redirect'])
    ).toBe(true);
  });

  it('allows Zapier MCP Client redirect with trailing slash', () => {
    expect(
      validateRedirectUris(['https://actions.zapier.com/oauth/redirect/'])
    ).toBe(true);
  });

  it('rejects Zapier with non-HTTPS', () => {
    expect(
      validateRedirectUris(['http://actions.zapier.com/oauth/redirect'])
    ).toBe(false);
  });
});
