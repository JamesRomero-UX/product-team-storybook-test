import { describe, expect, it } from 'vitest';

import { buildEntityTree } from './buildEntityTree';

describe('buildEntityTree', () => {
  // ── Empty / trivial inputs ──────────────────────────────────────────────────

  it('returns an empty array for an empty entity list', () => {
    expect(buildEntityTree([])).toEqual([]);
  });

  it('returns a single-node tree for a single entity with no children', () => {
    const result = buildEntityTree([{ Id: 'a', Name: 'Alpha', children: [] }]);
    expect(result).toEqual([{ id: 'a', name: 'Alpha' }]);
  });

  // ── Root detection ──────────────────────────────────────────────────────────

  it('returns all entities as roots when none are children of another', () => {
    const result = buildEntityTree([
      { Id: 'a', Name: 'Alpha' },
      { Id: 'b', Name: 'Beta' },
    ]);
    expect(result).toHaveLength(2);
    expect(result.map((n) => n.id)).toEqual(['a', 'b']);
  });

  it('does not include child entities in the root list — RSP-5685 core', () => {
    // USA is a root; ny is a child. Without the old filter, USA now appears.
    const result = buildEntityTree([
      { Id: 'usa', Name: 'USA', children: [{ Id: 'ny', Name: 'New York' }] },
      { Id: 'ny', Name: 'New York', children: [] },
    ]);
    // Only USA should be at the root — ny is nested under it
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('usa');
  });

  // ── Tree construction ───────────────────────────────────────────────────────

  it('nests direct children under their parent', () => {
    const result = buildEntityTree([
      { Id: 'usa', Name: 'USA', children: [{ Id: 'ny', Name: 'New York' }] },
      { Id: 'ny', Name: 'New York' },
    ]);
    expect(result[0].children).toEqual([{ id: 'ny', name: 'New York' }]);
  });

  it('constructs a 3-level hierarchy correctly', () => {
    const entities = [
      {
        Id: 'usa',
        Name: 'USA',
        children: [
          { Id: 'northeast', Name: 'Northeast' },
          { Id: 'tx', Name: 'Texas' },
        ],
      },
      {
        Id: 'northeast',
        Name: 'Northeast',
        children: [
          { Id: 'ny', Name: 'New York' },
          { Id: 'nj', Name: 'New Jersey' },
        ],
      },
      { Id: 'tx', Name: 'Texas' },
      { Id: 'ny', Name: 'New York' },
      { Id: 'nj', Name: 'New Jersey' },
    ];

    const result = buildEntityTree(entities);

    expect(result).toHaveLength(1);
    const usa = result[0];
    expect(usa.id).toBe('usa');
    expect(usa.children).toHaveLength(2);

    const northeast = usa.children!.find((c) => c.id === 'northeast')!;
    expect(northeast.children).toHaveLength(2);
    expect(northeast.children!.map((c) => c.id)).toEqual(['ny', 'nj']);

    const texas = usa.children!.find((c) => c.id === 'tx')!;
    expect(texas.children).toBeUndefined();
  });

  // ── Multiple roots ──────────────────────────────────────────────────────────

  it('handles multiple root entities each with their own subtree', () => {
    const entities = [
      { Id: 'usa', Name: 'USA', children: [{ Id: 'ny', Name: 'New York' }] },
      { Id: 'ny', Name: 'New York' },
      { Id: 'uk', Name: 'UK', children: [{ Id: 'lon', Name: 'London' }] },
      { Id: 'lon', Name: 'London' },
    ];

    const result = buildEntityTree(entities);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('usa');
    expect(result[0].children![0].id).toBe('ny');
    expect(result[1].id).toBe('uk');
    expect(result[1].children![0].id).toBe('lon');
  });

  // ── Leaf-only input (old state, before RSP-5685) ─────────────────────────

  it('returns a flat tree when all entities are leaf nodes (no children)', () => {
    const entities = [
      { Id: 'ny', Name: 'New York' },
      { Id: 'nj', Name: 'New Jersey' },
      { Id: 'tx', Name: 'Texas' },
    ];
    const result = buildEntityTree(entities);
    expect(result).toHaveLength(3);
    result.forEach((n) => expect(n.children).toBeUndefined());
  });
});
