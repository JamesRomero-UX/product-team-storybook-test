import { describe, expect, it } from 'vitest';

import { b64url, ub64url } from './buffer';

describe('buffer utils', () => {
  describe('b64url', () => {
    it('should encode a simple string to base64url', () => {
      const result = b64url('hello');
      expect(result).toBe('aGVsbG8');
    });

    it('should remove padding from base64 encoded string', () => {
      const result = b64url('a');
      // 'a' in base64 is 'YQ==' with padding
      expect(result).toBe('YQ');
      expect(result).not.toContain('=');
    });

    it('should not contain + characters (replaced with -)', () => {
      // Test with various strings to ensure no + appears
      const testStrings = ['hello world', 'test@example.com', '?>?', 'foo+bar'];
      testStrings.forEach((str) => {
        const result = b64url(str);
        expect(result).not.toContain('+');
      });
    });

    it('should not contain / characters (replaced with _)', () => {
      // Test with various strings to ensure no / appears
      const testStrings = ['hello world', 'test@example.com', '??', 'foo/bar'];
      testStrings.forEach((str) => {
        const result = b64url(str);
        expect(result).not.toContain('/');
      });
    });

    it('should handle empty string', () => {
      const result = b64url('');
      expect(result).toBe('');
    });

    it('should handle UTF-8 characters correctly', () => {
      const result = b64url('😀');
      expect(result).toBe('8J-YgA');
    });

    it('should handle special characters', () => {
      const result = b64url('test@example.com');
      expect(result).toBe('dGVzdEBleGFtcGxlLmNvbQ');
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);
      const result = b64url(longString);
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toContain('=');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
    });

    it('should produce URL-safe output', () => {
      const result = b64url('Many hands make light work.');
      // Check that result only contains URL-safe characters
      expect(result).toMatch(/^[A-Za-z0-9_-]*$/);
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should correctly encode and decode simple strings', () => {
      const original = 'hello world';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should correctly encode and decode complex strings', () => {
      const original =
        'Test string with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should correctly encode and decode UTF-8 emojis', () => {
      const original = '😀🎉🚀💻🌟';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should correctly encode and decode multiline strings', () => {
      const original = 'line1\nline2\nline3';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should correctly encode and decode JSON strings', () => {
      const original = JSON.stringify({ key: 'value', nested: { data: 123 } });
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle strings of various lengths', () => {
      const testCases = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef'];
      testCases.forEach((original) => {
        const encoded = b64url(original);
        const decoded = ub64url(encoded);
        expect(decoded).toBe(original);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle strings with only spaces', () => {
      const original = '   ';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle strings with tabs and newlines', () => {
      const original = 'test\t\n\r';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle numeric strings', () => {
      const original = '1234567890';
      const encoded = b64url(original);
      const decoded = ub64url(encoded);
      expect(decoded).toBe(original);
    });
  });
});
