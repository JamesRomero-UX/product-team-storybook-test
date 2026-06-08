import { describe, expect, it } from 'vitest';

import { toolDefinitions } from '../tools/registry';

const OAUTH_ONLY_TOOLS = ['get_risk_scores', 'list_tags', 'list_departments'];

describe('toolDefinitions', () => {
  it('all tools have availableVia field', () => {
    for (const tool of toolDefinitions) {
      expect(
        tool.availableVia,
        `${tool.name} missing availableVia`
      ).toBeDefined();
      expect(['all', 'oauth-only']).toContain(tool.availableVia);
    }
  });

  it('exactly 3 tools are tagged as oauth-only', () => {
    const oauthOnly = toolDefinitions.filter(
      (t) => t.availableVia === 'oauth-only'
    );
    expect(oauthOnly.map((t) => t.name).sort()).toEqual(
      [...OAUTH_ONLY_TOOLS].sort()
    );
  });

  it('remaining tools are tagged as all', () => {
    const allTools = toolDefinitions.filter((t) => t.availableVia === 'all');
    expect(allTools.length).toBe(
      toolDefinitions.length - OAUTH_ONLY_TOOLS.length
    );
    for (const tool of allTools) {
      expect(OAUTH_ONLY_TOOLS).not.toContain(tool.name);
    }
  });
});
