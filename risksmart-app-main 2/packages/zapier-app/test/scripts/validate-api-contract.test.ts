import { describe, expect, it } from 'vitest';

import type {
  BreakingChange,
  ContractSnapshot,
} from '../../scripts/lib/snapshot.js';
import { detectBreakingChanges } from '../../scripts/lib/snapshot.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnapshot(
  overrides: Partial<ContractSnapshot> = {}
): ContractSnapshot {
  return {
    version: '1.0.0',
    generatedAt: '2026-01-01T00:00:00.000Z',
    paths: {},
    schemas: {},
    ...overrides,
  };
}

function kinds(changes: BreakingChange[]): string[] {
  return changes.map((c) => c.kind);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('detectBreakingChanges', () => {
  it('returns empty array when snapshots are identical', () => {
    const snapshot = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: {
            responseSchema: { $ref: '#/components/schemas/RiskList' },
          },
        },
      },
      schemas: {
        RiskList: {
          type: 'object',
          properties: {
            data: { type: 'array' },
          },
        },
      },
    });

    const changes = detectBreakingChanges(snapshot, snapshot);
    expect(changes).toEqual([]);
  });

  it('detects removed field as breaking', () => {
    const old = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    });

    const current = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            // description removed
          },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['removed_field']);
    expect(changes[0].detail).toContain('description');
  });

  it('detects type changed as breaking', () => {
    const old = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: {
            tier: { type: 'number' },
          },
        },
      },
    });

    const current = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: {
            tier: { type: 'string' },
          },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['type_changed']);
    expect(changes[0].detail).toContain('number');
    expect(changes[0].detail).toContain('string');
  });

  it('detects new required input field as breaking', () => {
    const old = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          post: {
            requestSchema: { $ref: '#/components/schemas/CreateRisk' },
            responseSchema: { $ref: '#/components/schemas/MutationResponse' },
          },
        },
      },
      schemas: {
        CreateRisk: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
          },
        },
        MutationResponse: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    });

    const current = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          post: {
            requestSchema: { $ref: '#/components/schemas/CreateRisk' },
            responseSchema: { $ref: '#/components/schemas/MutationResponse' },
          },
        },
      },
      schemas: {
        CreateRisk: {
          type: 'object',
          required: ['title', 'owners'],
          properties: {
            title: { type: 'string' },
            owners: { type: 'array' },
          },
        },
        MutationResponse: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['required_added']);
    expect(changes[0].detail).toContain('owners');
  });

  it('detects endpoint removed as breaking', () => {
    const old = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
        },
        '/api/v1/controls': {
          get: { responseSchema: {} },
        },
      },
    });

    const current = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
        },
        // controls endpoint removed
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['endpoint_removed']);
    expect(changes[0].detail).toContain('/api/v1/controls');
  });

  it('detects removal of a single HTTP method from a path', () => {
    const old = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
          post: { requestSchema: {}, responseSchema: {} },
        },
      },
    });

    const current = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
          // post removed
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['endpoint_removed']);
    expect(changes[0].detail).toContain('POST');
  });

  it('allows added optional field (not breaking)', () => {
    const old = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    });

    const current = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            newOptionalField: { type: 'string' },
          },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toEqual([]);
  });

  it('allows added new endpoint (not breaking)', () => {
    const old = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
        },
      },
    });

    const current = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
        },
        '/api/v1/new-entity': {
          get: { responseSchema: {} },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toEqual([]);
  });

  it('detects schema removed entirely', () => {
    const old = makeSnapshot({
      schemas: {
        Risk: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    });

    const current = makeSnapshot({
      schemas: {},
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['removed_field']);
    expect(changes[0].detail).toContain('Risk');
    expect(changes[0].detail).toContain('removed entirely');
  });

  it('detects nested field changes in array items', () => {
    const old = makeSnapshot({
      schemas: {
        RiskList: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
        },
      },
    });

    const current = makeSnapshot({
      schemas: {
        RiskList: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  // title removed from nested items
                },
              },
            },
          },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes).toHaveLength(1);
    expect(kinds(changes)).toEqual(['removed_field']);
    expect(changes[0].detail).toContain('title');
  });

  it('handles multiple breaking changes at once', () => {
    const old = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
          post: {
            requestSchema: { $ref: '#/components/schemas/CreateRisk' },
            responseSchema: {},
          },
        },
        '/api/v1/controls': {
          get: { responseSchema: {} },
        },
      },
      schemas: {
        CreateRisk: {
          type: 'object',
          required: ['title'],
          properties: { title: { type: 'string' } },
        },
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    });

    const current = makeSnapshot({
      paths: {
        '/api/v1/risks': {
          get: { responseSchema: {} },
          post: {
            requestSchema: { $ref: '#/components/schemas/CreateRisk' },
            responseSchema: {},
          },
        },
        // controls removed
      },
      schemas: {
        CreateRisk: {
          type: 'object',
          required: ['title', 'owners'],
          properties: {
            title: { type: 'string' },
            owners: { type: 'array' },
          },
        },
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'number' }, // type changed
            // status removed
          },
        },
      },
    });

    const changes = detectBreakingChanges(old, current);
    expect(changes.length).toBeGreaterThanOrEqual(4);
    const changeKinds = new Set(kinds(changes));
    expect(changeKinds).toContain('endpoint_removed');
    expect(changeKinds).toContain('removed_field');
    expect(changeKinds).toContain('type_changed');
    expect(changeKinds).toContain('required_added');
  });
});
