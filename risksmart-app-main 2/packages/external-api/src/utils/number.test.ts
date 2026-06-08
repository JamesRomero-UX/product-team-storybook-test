import { describe, expect, it } from 'vitest';

import { toPositiveIntOrNull } from './number';

describe('number utils', () => {
  describe('toPositiveIntOrNull', () => {
    describe('valid positive integers', () => {
      it('should return a valid positive integer', () => {
        expect(toPositiveIntOrNull('1')).toBe(1);
        expect(toPositiveIntOrNull('42')).toBe(42);
        expect(toPositiveIntOrNull('123')).toBe(123);
        expect(toPositiveIntOrNull('999')).toBe(999);
      });

      it('should handle large positive integers', () => {
        expect(toPositiveIntOrNull('1000000')).toBe(1000000);
        expect(toPositiveIntOrNull('999999999')).toBe(999999999);
      });

      it('should handle max safe integer', () => {
        const maxSafeInt = Number.MAX_SAFE_INTEGER.toString();
        expect(toPositiveIntOrNull(maxSafeInt)).toBe(Number.MAX_SAFE_INTEGER);
      });

      it('should trim whitespace before parsing', () => {
        expect(toPositiveIntOrNull(' 123 ')).toBe(123);
        expect(toPositiveIntOrNull('  42  ')).toBe(42);
        expect(toPositiveIntOrNull('\t100\t')).toBe(100);
        expect(toPositiveIntOrNull('\n50\n')).toBe(50);
      });
    });

    describe('invalid inputs - zero and negative numbers', () => {
      it('should return null for zero', () => {
        expect(toPositiveIntOrNull('0')).toBeNull();
      });

      it('should return null for negative numbers', () => {
        expect(toPositiveIntOrNull('-1')).toBeNull();
        expect(toPositiveIntOrNull('-42')).toBeNull();
        expect(toPositiveIntOrNull('-999')).toBeNull();
      });
    });

    describe('invalid inputs - leading zeros', () => {
      it('should return null for numbers with leading zeros', () => {
        expect(toPositiveIntOrNull('01')).toBeNull();
        expect(toPositiveIntOrNull('001')).toBeNull();
        expect(toPositiveIntOrNull('0123')).toBeNull();
      });
    });

    describe('invalid inputs - non-numeric strings', () => {
      it('should return null for empty string', () => {
        expect(toPositiveIntOrNull('')).toBeNull();
      });

      it('should return null for whitespace only', () => {
        expect(toPositiveIntOrNull(' ')).toBeNull();
        expect(toPositiveIntOrNull('   ')).toBeNull();
        expect(toPositiveIntOrNull('\t')).toBeNull();
        expect(toPositiveIntOrNull('\n')).toBeNull();
      });

      it('should return null for non-numeric strings', () => {
        expect(toPositiveIntOrNull('abc')).toBeNull();
        expect(toPositiveIntOrNull('test')).toBeNull();
        expect(toPositiveIntOrNull('hello123')).toBeNull();
        expect(toPositiveIntOrNull('123hello')).toBeNull();
      });

      it('should return null for strings with special characters', () => {
        expect(toPositiveIntOrNull('12.3')).toBeNull();
        expect(toPositiveIntOrNull('12,3')).toBeNull();
        expect(toPositiveIntOrNull('12_3')).toBeNull();
        expect(toPositiveIntOrNull('12-3')).toBeNull();
        expect(toPositiveIntOrNull('12+3')).toBeNull();
      });

      it('should return null for decimal numbers', () => {
        expect(toPositiveIntOrNull('1.5')).toBeNull();
        expect(toPositiveIntOrNull('42.0')).toBeNull();
        expect(toPositiveIntOrNull('0.5')).toBeNull();
      });
    });

    describe('invalid inputs - floating point notation', () => {
      it('should return null for scientific notation', () => {
        expect(toPositiveIntOrNull('1e5')).toBeNull();
        expect(toPositiveIntOrNull('1E5')).toBeNull();
        expect(toPositiveIntOrNull('1.5e2')).toBeNull();
      });

      it('should return null for hexadecimal notation', () => {
        expect(toPositiveIntOrNull('0x10')).toBeNull();
        expect(toPositiveIntOrNull('0xFF')).toBeNull();
      });

      it('should return null for octal notation', () => {
        expect(toPositiveIntOrNull('0o10')).toBeNull();
      });

      it('should return null for binary notation', () => {
        expect(toPositiveIntOrNull('0b10')).toBeNull();
      });
    });

    describe('invalid inputs - unsafe integers', () => {
      it('should return null for numbers above MAX_SAFE_INTEGER', () => {
        const aboveMax = (Number.MAX_SAFE_INTEGER + 1).toString();
        expect(toPositiveIntOrNull(aboveMax)).toBeNull();
      });

      it('should return null for very large numbers', () => {
        expect(toPositiveIntOrNull('99999999999999999999')).toBeNull();
        expect(toPositiveIntOrNull('10000000000000000000')).toBeNull();
      });
    });

    describe('invalid inputs - type checking', () => {
      it('should handle the type guard for non-string inputs at runtime', () => {
        // The function has a typeof check, so we test it handles non-strings gracefully
        // In real usage, TypeScript would prevent this, but we test the runtime behavior
        const testFn = toPositiveIntOrNull as (input: unknown) => number | null;

        expect(testFn(123)).toBeNull();
        expect(testFn(null)).toBeNull();
        expect(testFn(undefined)).toBeNull();
        expect(testFn({})).toBeNull();
        expect(testFn([])).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle string "1" correctly', () => {
        expect(toPositiveIntOrNull('1')).toBe(1);
      });

      it('should return null for plus sign prefix', () => {
        expect(toPositiveIntOrNull('+1')).toBeNull();
        expect(toPositiveIntOrNull('+42')).toBeNull();
      });

      it('should handle mixed whitespace', () => {
        expect(toPositiveIntOrNull(' \t\n123\n\t ')).toBe(123);
      });

      it('should return null for infinity', () => {
        expect(toPositiveIntOrNull('Infinity')).toBeNull();
        expect(toPositiveIntOrNull('-Infinity')).toBeNull();
      });

      it('should return null for NaN string', () => {
        expect(toPositiveIntOrNull('NaN')).toBeNull();
      });
    });
  });
});
