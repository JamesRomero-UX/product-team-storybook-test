/**
 * EventBridge Pattern Matcher
 *
 * Implements the full EventBridge content-based filtering specification:
 * - Exact value matching (string, number, null)
 * - Prefix matching: { prefix: "us-" }
 * - Suffix matching: { suffix: ".png" }
 * - Equals-ignore-case: { "equals-ignore-case": "example" }
 * - Wildcard matching: { wildcard: "dir/*.png" }
 * - Numeric matching: { numeric: [">=", 100, "<", 200] }
 * - Exists matching: { exists: true/false }
 * - CIDR matching: { cidr: "10.0.0.0/24" }
 * - Anything-but matching (with all variants)
 * - $or matching for cross-field OR logic
 *
 * @see https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns-content-based-filtering.html
 */

/**
 * Matches a string against a wildcard pattern.
 * `*` matches any sequence of characters; `\*` is a literal asterisk;
 * `\\` is a literal backslash.
 */
const matchWildcard = (value, pattern) => {
  if (typeof value !== 'string') return false;

  // Convert wildcard pattern to regex
  let regex = '';
  let i = 0;
  while (i < pattern.length) {
    if (pattern[i] === '\\' && i + 1 < pattern.length) {
      // Escaped character
      const next = pattern[i + 1];
      if (next === '*' || next === '\\') {
        regex += escapeRegex(next);
        i += 2;
        continue;
      }
    }
    if (pattern[i] === '*') {
      regex += '.*';
    } else {
      regex += escapeRegex(pattern[i]);
    }
    i++;
  }

  return new RegExp(`^${regex}$`).test(value);
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Parses a CIDR notation string and returns a function that tests IPs.
 * Supports IPv4 only (sufficient for local dev).
 */
const matchCidr = (value, cidr) => {
  if (typeof value !== 'string') return false;

  const [cidrIp, prefixLen] = cidr.split('/');
  const mask = prefixLen !== undefined ? parseInt(prefixLen, 10) : 32;

  const ipToInt = (ip) => {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  };

  const cidrInt = ipToInt(cidrIp);
  const maskBits = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;
  const valueInt = ipToInt(value);

  return (valueInt & maskBits) === (cidrInt & maskBits);
};

/**
 * Evaluates a single numeric comparison pair.
 */
const evalNumericOp = (value, op, target) => {
  switch (op) {
    case '=': return value === target;
    case '>': return value > target;
    case '>=': return value >= target;
    case '<': return value < target;
    case '<=': return value <= target;
    default: return false;
  }
};

/**
 * Evaluates a numeric filter: [">=", 100, "<", 200]
 * Conditions are paired as [op, value, op, value, ...] and all must match (AND).
 */
const matchNumeric = (fieldValue, conditions) => {
  if (typeof fieldValue !== 'number') return false;

  for (let i = 0; i < conditions.length; i += 2) {
    if (!evalNumericOp(fieldValue, conditions[i], conditions[i + 1])) {
      return false;
    }
  }
  return true;
};

/**
 * Coerces a value or array of values into an array for uniform processing.
 */
const toArray = (v) => (Array.isArray(v) ? v : [v]);

/**
 * Tests whether a primitive value matches a single comparison operator object.
 *
 * Returns true if the operator matches, false otherwise, or undefined if
 * the pattern value is not a recognised operator (i.e. it's a plain value).
 */
const matchOperator = (fieldValue, patternValue) => {
  if (patternValue === null || typeof patternValue !== 'object') {
    return undefined; // not an operator
  }

  // exists
  if ('exists' in patternValue) {
    const fieldExists = fieldValue !== undefined && fieldValue !== null;
    return patternValue.exists ? fieldExists : !fieldExists;
  }

  // prefix (with optional equals-ignore-case)
  if ('prefix' in patternValue) {
    if (typeof fieldValue !== 'string') return false;
    const prefixVal = patternValue.prefix;
    if (typeof prefixVal === 'object' && prefixVal !== null && 'equals-ignore-case' in prefixVal) {
      return fieldValue.toLowerCase().startsWith(prefixVal['equals-ignore-case'].toLowerCase());
    }
    return fieldValue.startsWith(prefixVal);
  }

  // suffix (with optional equals-ignore-case)
  if ('suffix' in patternValue) {
    if (typeof fieldValue !== 'string') return false;
    const suffixVal = patternValue.suffix;
    if (typeof suffixVal === 'object' && suffixVal !== null && 'equals-ignore-case' in suffixVal) {
      return fieldValue.toLowerCase().endsWith(suffixVal['equals-ignore-case'].toLowerCase());
    }
    return fieldValue.endsWith(suffixVal);
  }

  // equals-ignore-case
  if ('equals-ignore-case' in patternValue) {
    if (typeof fieldValue !== 'string') return false;
    return fieldValue.toLowerCase() === patternValue['equals-ignore-case'].toLowerCase();
  }

  // wildcard
  if ('wildcard' in patternValue) {
    return matchWildcard(fieldValue, patternValue.wildcard);
  }

  // numeric
  if ('numeric' in patternValue) {
    return matchNumeric(fieldValue, patternValue.numeric);
  }

  // cidr
  if ('cidr' in patternValue) {
    return matchCidr(fieldValue, patternValue.cidr);
  }

  // anything-but
  if ('anything-but' in patternValue) {
    return matchAnythingBut(fieldValue, patternValue['anything-but']);
  }

  return undefined; // unknown operator — treat as non-operator
};

/**
 * Implements anything-but with all variants:
 * - anything-but: "value" | ["value1", "value2"] | 100 | [100, 200]
 * - anything-but: { prefix: "init" | ["init", "stop"] }
 * - anything-but: { suffix: ".txt" | [".txt", ".rtf"] }
 * - anything-but: { equals-ignore-case: "init" | ["init", "stop"] }
 * - anything-but: { wildcard: "*.txt" | ["*.txt", "*.rtf"] }
 */
const matchAnythingBut = (fieldValue, abValue) => {
  // anything-but with a nested operator (prefix, suffix, equals-ignore-case, wildcard)
  if (abValue !== null && typeof abValue === 'object' && !Array.isArray(abValue)) {
    const operatorKey = Object.keys(abValue)[0];
    const operatorValues = toArray(abValue[operatorKey]);

    for (const v of operatorValues) {
      const inner = { [operatorKey]: v };
      const result = matchOperator(fieldValue, inner);
      if (result === true) return false; // matched the inner op, so anything-but fails
    }
    return true;
  }

  // anything-but with plain values (string, number, or array of them)
  const values = toArray(abValue);
  for (const v of values) {
    if (fieldValue === v) return false;
  }
  return true;
};

/**
 * Checks if a single field value matches any element in a pattern value array.
 *
 * Pattern values can be:
 * - Primitives (string, number, null): exact match
 * - Operator objects: { prefix, suffix, numeric, exists, cidr, wildcard,
 *   equals-ignore-case, anything-but }
 *
 * Multiple values in the array are OR'd — if any matches, the field matches.
 */
const matchFieldValue = (fieldValue, patternValues) => {
  for (const patternValue of patternValues) {
    // Exact match for primitives (string, number, null)
    if (patternValue === null || typeof patternValue !== 'object') {
      if (fieldValue === patternValue) return true;
      continue;
    }

    // Operator match
    const result = matchOperator(fieldValue, patternValue);
    if (result === true) return true;
    if (result === false) continue;

    // Unknown object — skip
  }

  return false;
};

/**
 * Recursively matches an event object against an EventBridge event pattern.
 *
 * All top-level keys in the pattern must match (AND logic).
 * Array values at leaf nodes use OR logic (any element can match).
 * $or arrays provide cross-field OR logic.
 */
export const matchesPattern = (event, pattern) => {
  for (const [key, patternValue] of Object.entries(pattern)) {
    // $or — at least one sub-pattern must match
    if (key === '$or') {
      const orPatterns = patternValue;
      const anyMatch = orPatterns.some((subPattern) =>
        matchesPattern(event, subPattern)
      );
      if (!anyMatch) return false;
      continue;
    }

    const eventValue = event[key];

    // Array — match field value against pattern values (leaf node)
    if (Array.isArray(patternValue)) {
      if (!matchFieldValue(eventValue, patternValue)) {
        return false;
      }
      continue;
    }

    // Nested object — recurse
    if (
      patternValue !== null &&
      typeof patternValue === 'object'
    ) {
      if (eventValue === undefined || eventValue === null) {
        // Check if all nested conditions are exists: false
        const allNonExist = Object.values(patternValue).every(
          (v) =>
            Array.isArray(v) &&
            v.length === 1 &&
            typeof v[0] === 'object' &&
            v[0] !== null &&
            'exists' in v[0] &&
            !v[0].exists
        );
        if (allNonExist) continue;
        return false;
      }

      if (!matchesPattern(eventValue, patternValue)) {
        return false;
      }
      continue;
    }
  }

  return true;
};
