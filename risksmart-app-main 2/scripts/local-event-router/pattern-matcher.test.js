import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { matchesPattern } from './pattern-matcher.js';

// ─── Exact Value Matching ──────────────────────────────────────

describe('exact value matching', () => {
  it('matches exact string', () => {
    assert.equal(matchesPattern(
      { source: 'aws.ec2' },
      { source: ['aws.ec2'] }
    ), true);
  });

  it('rejects non-matching string', () => {
    assert.equal(matchesPattern(
      { source: 'aws.s3' },
      { source: ['aws.ec2'] }
    ), false);
  });

  it('matches any of multiple values (OR)', () => {
    assert.equal(matchesPattern(
      { source: 'aws.s3' },
      { source: ['aws.ec2', 'aws.s3'] }
    ), true);
  });

  it('matches exact number', () => {
    assert.equal(matchesPattern(
      { detail: { count: 5 } },
      { detail: { count: [5] } }
    ), true);
  });

  it('matches null value', () => {
    assert.equal(matchesPattern(
      { detail: { UserID: null } },
      { detail: { UserID: [null] } }
    ), true);
  });

  it('matches empty string', () => {
    assert.equal(matchesPattern(
      { detail: { LastName: '' } },
      { detail: { LastName: [''] } }
    ), true);
  });

  it('requires all fields to match (AND)', () => {
    assert.equal(matchesPattern(
      { source: 'aws.ec2', 'detail-type': 'StateChange' },
      { source: ['aws.ec2'], 'detail-type': ['StateChange'] }
    ), true);

    assert.equal(matchesPattern(
      { source: 'aws.ec2', 'detail-type': 'Other' },
      { source: ['aws.ec2'], 'detail-type': ['StateChange'] }
    ), false);
  });
});

// ─── Prefix Matching ───────────────────────────────────────────

describe('prefix matching', () => {
  it('matches prefix', () => {
    assert.equal(matchesPattern(
      { source: 'us-east-1' },
      { source: [{ prefix: 'us-' }] }
    ), true);
  });

  it('rejects non-matching prefix', () => {
    assert.equal(matchesPattern(
      { source: 'eu-west-1' },
      { source: [{ prefix: 'us-' }] }
    ), false);
  });

  it('matches prefix with equals-ignore-case', () => {
    assert.equal(matchesPattern(
      { service: 'EventBridge' },
      { service: [{ prefix: { 'equals-ignore-case': 'eventb' } }] }
    ), true);
  });

  it('rejects non-string for prefix', () => {
    assert.equal(matchesPattern(
      { source: 123 },
      { source: [{ prefix: '12' }] }
    ), false);
  });
});

// ─── Suffix Matching ───────────────────────────────────────────

describe('suffix matching', () => {
  it('matches suffix', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'photo.png' } },
      { detail: { FileName: [{ suffix: '.png' }] } }
    ), true);
  });

  it('rejects non-matching suffix', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'photo.jpg' } },
      { detail: { FileName: [{ suffix: '.png' }] } }
    ), false);
  });

  it('matches suffix with equals-ignore-case', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'photo.PNG' } },
      { detail: { FileName: [{ suffix: { 'equals-ignore-case': '.png' } }] } }
    ), true);
  });
});

// ─── Equals-Ignore-Case ────────────────────────────────────────

describe('equals-ignore-case matching', () => {
  it('matches case-insensitively', () => {
    assert.equal(matchesPattern(
      { 'detail-type': 'EC2 Instance State-change Notification' },
      { 'detail-type': [{ 'equals-ignore-case': 'ec2 instance state-change notification' }] }
    ), true);
  });

  it('rejects different string', () => {
    assert.equal(matchesPattern(
      { 'detail-type': 'Something Else' },
      { 'detail-type': [{ 'equals-ignore-case': 'ec2 instance state-change notification' }] }
    ), false);
  });

  it('rejects non-string', () => {
    assert.equal(matchesPattern(
      { 'detail-type': 42 },
      { 'detail-type': [{ 'equals-ignore-case': '42' }] }
    ), false);
  });
});

// ─── Wildcard Matching ─────────────────────────────────────────

describe('wildcard matching', () => {
  it('matches wildcard pattern', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'dir/photo.png' } },
      { detail: { FileName: [{ wildcard: 'dir/*.png' }] } }
    ), true);
  });

  it('rejects non-matching wildcard', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'dir/photo.jpg' } },
      { detail: { FileName: [{ wildcard: 'dir/*.png' }] } }
    ), false);
  });

  it('matches wildcard at start', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'any/path/file.txt' } },
      { detail: { FileName: [{ wildcard: '*.txt' }] } }
    ), true);
  });

  it('handles escaped asterisk', () => {
    assert.equal(matchesPattern(
      { detail: { value: 'hello*world' } },
      { detail: { value: [{ wildcard: 'hello\\*world' }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { value: 'helloXworld' } },
      { detail: { value: [{ wildcard: 'hello\\*world' }] } }
    ), false);
  });

  it('handles escaped backslash', () => {
    assert.equal(matchesPattern(
      { detail: { value: 'hello\\world' } },
      { detail: { value: [{ wildcard: 'hello\\\\world' }] } }
    ), true);
  });
});

// ─── Numeric Matching ──────────────────────────────────────────

describe('numeric matching', () => {
  it('matches equals', () => {
    assert.equal(matchesPattern(
      { detail: { Price: 100 } },
      { detail: { Price: [{ numeric: ['=', 100] }] } }
    ), true);
  });

  it('rejects non-equal', () => {
    assert.equal(matchesPattern(
      { detail: { Price: 99 } },
      { detail: { Price: [{ numeric: ['=', 100] }] } }
    ), false);
  });

  it('matches greater than', () => {
    assert.equal(matchesPattern(
      { detail: { count: 5 } },
      { detail: { count: [{ numeric: ['>', 0] }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { count: 0 } },
      { detail: { count: [{ numeric: ['>', 0] }] } }
    ), false);
  });

  it('matches greater than or equal', () => {
    assert.equal(matchesPattern(
      { detail: { count: 10 } },
      { detail: { count: [{ numeric: ['>=', 10] }] } }
    ), true);
  });

  it('matches less than', () => {
    assert.equal(matchesPattern(
      { detail: { count: 5 } },
      { detail: { count: [{ numeric: ['<', 10] }] } }
    ), true);
  });

  it('matches less than or equal', () => {
    assert.equal(matchesPattern(
      { detail: { count: 10 } },
      { detail: { count: [{ numeric: ['<=', 10] }] } }
    ), true);
  });

  it('matches range', () => {
    assert.equal(matchesPattern(
      { detail: { Price: 15 } },
      { detail: { Price: [{ numeric: ['>', 10, '<=', 20] }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { Price: 10 } },
      { detail: { Price: [{ numeric: ['>', 10, '<=', 20] }] } }
    ), false);

    assert.equal(matchesPattern(
      { detail: { Price: 20 } },
      { detail: { Price: [{ numeric: ['>', 10, '<=', 20] }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { Price: 21 } },
      { detail: { Price: [{ numeric: ['>', 10, '<=', 20] }] } }
    ), false);
  });

  it('matches scientific notation', () => {
    assert.equal(matchesPattern(
      { detail: { limit: 301.8 } },
      { detail: { limit: [{ numeric: ['=', 3.018e2] }] } }
    ), true);
  });

  it('rejects non-number', () => {
    assert.equal(matchesPattern(
      { detail: { Price: '100' } },
      { detail: { Price: [{ numeric: ['=', 100] }] } }
    ), false);
  });
});

// ─── Exists Matching ───────────────────────────────────────────

describe('exists matching', () => {
  it('matches when field exists', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ exists: true }] } }
    ), true);
  });

  it('rejects when field is missing and exists: true', () => {
    assert.equal(matchesPattern(
      { detail: {} },
      { detail: { state: [{ exists: true }] } }
    ), false);
  });

  it('matches when field is missing and exists: false', () => {
    assert.equal(matchesPattern(
      { detail: {} },
      { detail: { state: [{ exists: false }] } }
    ), true);
  });

  it('rejects when field exists and exists: false', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ exists: false }] } }
    ), false);
  });

  it('treats null as not existing', () => {
    assert.equal(matchesPattern(
      { detail: { state: null } },
      { detail: { state: [{ exists: true }] } }
    ), false);

    assert.equal(matchesPattern(
      { detail: { state: null } },
      { detail: { state: [{ exists: false }] } }
    ), true);
  });

  it('handles nested exists: false when parent is missing', () => {
    assert.equal(matchesPattern(
      {},
      { detail: { state: [{ exists: false }] } }
    ), true);
  });
});

// ─── CIDR Matching ─────────────────────────────────────────────

describe('CIDR matching', () => {
  it('matches IP in range', () => {
    assert.equal(matchesPattern(
      { detail: { sourceIP: '10.0.0.42' } },
      { detail: { sourceIP: [{ cidr: '10.0.0.0/24' }] } }
    ), true);
  });

  it('rejects IP outside range', () => {
    assert.equal(matchesPattern(
      { detail: { sourceIP: '10.0.1.42' } },
      { detail: { sourceIP: [{ cidr: '10.0.0.0/24' }] } }
    ), false);
  });

  it('matches /32 exact IP', () => {
    assert.equal(matchesPattern(
      { detail: { sourceIP: '192.168.1.1' } },
      { detail: { sourceIP: [{ cidr: '192.168.1.1/32' }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { sourceIP: '192.168.1.2' } },
      { detail: { sourceIP: [{ cidr: '192.168.1.1/32' }] } }
    ), false);
  });

  it('matches /0 any IP', () => {
    assert.equal(matchesPattern(
      { detail: { sourceIP: '1.2.3.4' } },
      { detail: { sourceIP: [{ cidr: '0.0.0.0/0' }] } }
    ), true);
  });

  it('matches /16 subnet', () => {
    assert.equal(matchesPattern(
      { detail: { sourceIP: '172.16.255.255' } },
      { detail: { sourceIP: [{ cidr: '172.16.0.0/16' }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { sourceIP: '172.17.0.1' } },
      { detail: { sourceIP: [{ cidr: '172.16.0.0/16' }] } }
    ), false);
  });
});

// ─── Anything-But Matching ─────────────────────────────────────

describe('anything-but matching', () => {
  it('matches when value is not in list', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ 'anything-but': 'initializing' }] } }
    ), true);
  });

  it('rejects when value matches', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'initializing' } },
      { detail: { state: [{ 'anything-but': 'initializing' }] } }
    ), false);
  });

  it('works with array of values', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ 'anything-but': ['stopped', 'overloaded'] }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'stopped' } },
      { detail: { state: [{ 'anything-but': ['stopped', 'overloaded'] }] } }
    ), false);
  });

  it('works with numbers', () => {
    assert.equal(matchesPattern(
      { detail: { limit: 150 } },
      { detail: { limit: [{ 'anything-but': [100, 200, 300] }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { limit: 200 } },
      { detail: { limit: [{ 'anything-but': [100, 200, 300] }] } }
    ), false);
  });

  it('works with prefix', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ 'anything-but': { prefix: 'init' } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'initializing' } },
      { detail: { state: [{ 'anything-but': { prefix: 'init' } }] } }
    ), false);
  });

  it('works with prefix array', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ 'anything-but': { prefix: ['init', 'stop'] } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'stopping' } },
      { detail: { state: [{ 'anything-but': { prefix: ['init', 'stop'] } }] } }
    ), false);
  });

  it('works with suffix', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'photo.png' } },
      { detail: { FileName: [{ 'anything-but': { suffix: '.txt' } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { FileName: 'readme.txt' } },
      { detail: { FileName: [{ 'anything-but': { suffix: '.txt' } }] } }
    ), false);
  });

  it('works with suffix array', () => {
    assert.equal(matchesPattern(
      { detail: { FileName: 'photo.png' } },
      { detail: { FileName: [{ 'anything-but': { suffix: ['.txt', '.rtf'] } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { FileName: 'readme.rtf' } },
      { detail: { FileName: [{ 'anything-but': { suffix: ['.txt', '.rtf'] } }] } }
    ), false);
  });

  it('works with equals-ignore-case', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ 'anything-but': { 'equals-ignore-case': 'INITIALIZING' } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'Initializing' } },
      { detail: { state: [{ 'anything-but': { 'equals-ignore-case': 'INITIALIZING' } }] } }
    ), false);
  });

  it('works with equals-ignore-case array', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'running' } },
      { detail: { state: [{ 'anything-but': { 'equals-ignore-case': ['INITIALIZING', 'STOPPED'] } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'Stopped' } },
      { detail: { state: [{ 'anything-but': { 'equals-ignore-case': ['INITIALIZING', 'STOPPED'] } }] } }
    ), false);
  });

  it('works with wildcard', () => {
    assert.equal(matchesPattern(
      { detail: { path: '/src/app.js' } },
      { detail: { path: [{ 'anything-but': { wildcard: '*/lib/*' } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { path: '/src/lib/util.js' } },
      { detail: { path: [{ 'anything-but': { wildcard: '*/lib/*' } }] } }
    ), false);
  });

  it('works with wildcard array', () => {
    assert.equal(matchesPattern(
      { detail: { path: '/src/app.js' } },
      { detail: { path: [{ 'anything-but': { wildcard: ['*/lib/*', '*/bin/*'] } }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { path: '/usr/bin/node' } },
      { detail: { path: [{ 'anything-but': { wildcard: ['*/lib/*', '*/bin/*'] } }] } }
    ), false);
  });
});

// ─── $or Matching ──────────────────────────────────────────────

describe('$or matching', () => {
  it('matches when any sub-pattern matches', () => {
    assert.equal(matchesPattern(
      { detail: { Location: 'New York', Day: 'Tuesday' } },
      { detail: { $or: [{ Location: ['New York'] }, { Day: ['Monday'] }] } }
    ), true);
  });

  it('rejects when no sub-pattern matches', () => {
    assert.equal(matchesPattern(
      { detail: { Location: 'Boston', Day: 'Tuesday' } },
      { detail: { $or: [{ Location: ['New York'] }, { Day: ['Monday'] }] } }
    ), false);
  });

  it('combines with other fields (AND with $or)', () => {
    assert.equal(matchesPattern(
      { source: 'aws.ec2', detail: { Location: 'New York', Day: 'Tuesday' } },
      {
        source: ['aws.ec2'],
        detail: { $or: [{ Location: ['New York'] }, { Day: ['Monday'] }] },
      }
    ), true);

    assert.equal(matchesPattern(
      { source: 'aws.s3', detail: { Location: 'New York', Day: 'Tuesday' } },
      {
        source: ['aws.ec2'],
        detail: { $or: [{ Location: ['New York'] }, { Day: ['Monday'] }] },
      }
    ), false);
  });

  it('works with numeric operators inside $or', () => {
    assert.equal(matchesPattern(
      { detail: { 'c-count': 3, 'd-count': 15, 'x-limit': 500 } },
      {
        detail: {
          $or: [
            { 'c-count': [{ numeric: ['>', 0, '<=', 5] }] },
            { 'd-count': [{ numeric: ['<', 10] }] },
            { 'x-limit': [{ numeric: ['=', 3.018e2] }] },
          ],
        },
      }
    ), true);
  });
});

// ─── Nested Patterns ───────────────────────────────────────────

describe('nested patterns', () => {
  it('matches deeply nested fields', () => {
    assert.equal(matchesPattern(
      { detail: { metadata: { tenant: 'acme' } } },
      { detail: { metadata: { tenant: [{ exists: true }] } } }
    ), true);
  });

  it('rejects missing nested fields', () => {
    assert.equal(matchesPattern(
      { detail: { metadata: {} } },
      { detail: { metadata: { tenant: [{ exists: true }] } } }
    ), false);
  });

  it('handles missing intermediate objects with exists: false', () => {
    assert.equal(matchesPattern(
      { detail: {} },
      { detail: { metadata: { tenant: [{ exists: false }] } } }
    ), true);
  });
});

// ─── Mixed Operators in a Single Array ─────────────────────────

describe('mixed operators in pattern array', () => {
  it('matches if any operator in the array matches (OR)', () => {
    assert.equal(matchesPattern(
      { detail: { state: 'us-east-1-running' } },
      { detail: { state: [{ prefix: 'us-' }, { suffix: '-active' }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'eu-west-1-active' } },
      { detail: { state: [{ prefix: 'us-' }, { suffix: '-active' }] } }
    ), true);

    assert.equal(matchesPattern(
      { detail: { state: 'eu-west-1-stopped' } },
      { detail: { state: [{ prefix: 'us-' }, { suffix: '-active' }] } }
    ), false);
  });

  it('mixes exact values and operators', () => {
    assert.equal(matchesPattern(
      { source: 'custom.app' },
      { source: ['custom.app', { prefix: 'aws.' }] }
    ), true);

    assert.equal(matchesPattern(
      { source: 'aws.ec2' },
      { source: ['custom.app', { prefix: 'aws.' }] }
    ), true);

    assert.equal(matchesPattern(
      { source: 'other.thing' },
      { source: ['custom.app', { prefix: 'aws.' }] }
    ), false);
  });
});
