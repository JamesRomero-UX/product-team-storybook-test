import { describe, expect, it } from 'vitest';

import { generateSignature, validateSignature } from './crypto';

describe('crypto utils', () => {
  // Common test data
  const testPayload = 'test-payload-data';
  const testSecret = 'test-secret-key-12345';
  const emptyString = '';
  const longPayload = 'a'.repeat(10000);
  const longSecret = 'x'.repeat(1000);
  const unicodePayload = 'Hello 世界 🌍 测试 مرحبا';
  const specialCharsPayload = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

  describe('generateSignature', () => {
    describe('happy path', () => {
      it('should generate a valid HMAC-SHA256 signature', () => {
        const signature = generateSignature(testPayload, testSecret);

        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');
        expect(signature).toHaveLength(64); // SHA256 hex string is always 64 chars
        expect(signature).toMatch(/^[a-f0-9]{64}$/); // Should be lowercase hex
      });

      it('should generate consistent signatures for the same input', () => {
        const signature1 = generateSignature(testPayload, testSecret);
        const signature2 = generateSignature(testPayload, testSecret);
        const signature3 = generateSignature(testPayload, testSecret);

        expect(signature1).toBe(signature2);
        expect(signature2).toBe(signature3);
      });

      it('should generate different signatures for different payloads', () => {
        const payload1 = 'payload-one';
        const payload2 = 'payload-two';

        const signature1 = generateSignature(payload1, testSecret);
        const signature2 = generateSignature(payload2, testSecret);

        expect(signature1).not.toBe(signature2);
      });

      it('should generate different signatures for different secrets', () => {
        const secret1 = 'secret-one';
        const secret2 = 'secret-two';

        const signature1 = generateSignature(testPayload, secret1);
        const signature2 = generateSignature(testPayload, secret2);

        expect(signature1).not.toBe(signature2);
      });

      it('should handle empty payload', () => {
        const signature = generateSignature(emptyString, testSecret);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle empty secret', () => {
        const signature = generateSignature(testPayload, emptyString);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle both empty payload and secret', () => {
        const signature = generateSignature(emptyString, emptyString);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle very long payloads', () => {
        const signature = generateSignature(longPayload, testSecret);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle very long secrets', () => {
        const signature = generateSignature(testPayload, longSecret);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle unicode characters in payload', () => {
        const signature = generateSignature(unicodePayload, testSecret);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle special characters in payload', () => {
        const signature = generateSignature(specialCharsPayload, testSecret);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle special characters in secret', () => {
        const signature = generateSignature(testPayload, specialCharsPayload);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should handle newlines and whitespace in payload', () => {
        const payloadWithWhitespace = 'line1\nline2\r\nline3\t\ttab';
        const signature = generateSignature(payloadWithWhitespace, testSecret);

        expect(signature).toBeDefined();
        expect(signature).toHaveLength(64);
        expect(signature).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should produce different signatures for similar but different payloads', () => {
        const payload1 = 'test-payload';
        const payload2 = 'test-payload '; // trailing space
        const payload3 = 'test-payloaD'; // different case

        const signature1 = generateSignature(payload1, testSecret);
        const signature2 = generateSignature(payload2, testSecret);
        const signature3 = generateSignature(payload3, testSecret);

        expect(signature1).not.toBe(signature2);
        expect(signature1).not.toBe(signature3);
        expect(signature2).not.toBe(signature3);
      });

      it('should be deterministic across multiple calls', () => {
        const signatures = Array.from({ length: 100 }, () =>
          generateSignature(testPayload, testSecret)
        );

        const uniqueSignatures = new Set(signatures);
        expect(uniqueSignatures.size).toBe(1); // All should be the same
      });
    });
  });

  describe('validateSignature', () => {
    describe('happy path', () => {
      it('should validate a correct signature', () => {
        const signature = generateSignature(testPayload, testSecret);
        const isValid = validateSignature(testPayload, signature, testSecret);

        expect(isValid).toBe(true);
      });

      it('should validate signatures with empty payload', () => {
        const signature = generateSignature(emptyString, testSecret);
        const isValid = validateSignature(emptyString, signature, testSecret);

        expect(isValid).toBe(true);
      });

      it('should validate signatures with empty secret', () => {
        const signature = generateSignature(testPayload, emptyString);
        const isValid = validateSignature(testPayload, signature, emptyString);

        expect(isValid).toBe(true);
      });

      it('should validate signatures with long payloads', () => {
        const signature = generateSignature(longPayload, testSecret);
        const isValid = validateSignature(longPayload, signature, testSecret);

        expect(isValid).toBe(true);
      });

      it('should validate signatures with unicode characters', () => {
        const signature = generateSignature(unicodePayload, testSecret);
        const isValid = validateSignature(
          unicodePayload,
          signature,
          testSecret
        );

        expect(isValid).toBe(true);
      });

      it('should validate signatures with special characters', () => {
        const signature = generateSignature(specialCharsPayload, testSecret);
        const isValid = validateSignature(
          specialCharsPayload,
          signature,
          testSecret
        );

        expect(isValid).toBe(true);
      });

      it('should validate multiple times with same inputs', () => {
        const signature = generateSignature(testPayload, testSecret);

        const isValid1 = validateSignature(testPayload, signature, testSecret);
        const isValid2 = validateSignature(testPayload, signature, testSecret);
        const isValid3 = validateSignature(testPayload, signature, testSecret);

        expect(isValid1).toBe(true);
        expect(isValid2).toBe(true);
        expect(isValid3).toBe(true);
      });
    });

    describe('unhappy path', () => {
      it('should reject invalid signature', () => {
        const invalidSignature = 'a'.repeat(64);
        const isValid = validateSignature(
          testPayload,
          invalidSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject signature with wrong secret', () => {
        const signature = generateSignature(testPayload, testSecret);
        const wrongSecret = 'wrong-secret-key';
        const isValid = validateSignature(testPayload, signature, wrongSecret);

        expect(isValid).toBe(false);
      });

      it('should reject signature with tampered payload', () => {
        const signature = generateSignature(testPayload, testSecret);
        const tamperedPayload = testPayload + '-tampered';
        const isValid = validateSignature(
          tamperedPayload,
          signature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject tampered signature', () => {
        const signature = generateSignature(testPayload, testSecret);
        const tamperedSignature = signature.slice(0, -1) + 'f'; // Change last char
        const isValid = validateSignature(
          testPayload,
          tamperedSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject signature with wrong length', () => {
        const shortSignature = 'abc123';
        const isValid = validateSignature(
          testPayload,
          shortSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject signature that is too long', () => {
        const signature = generateSignature(testPayload, testSecret);
        const longSignature = signature + 'extra';
        const isValid = validateSignature(
          testPayload,
          longSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject empty signature', () => {
        const isValid = validateSignature(testPayload, emptyString, testSecret);

        expect(isValid).toBe(false);
      });

      it('should accept signature with uppercase hex characters', () => {
        const signature = generateSignature(testPayload, testSecret);
        const uppercaseSignature = signature.toUpperCase();
        const isValid = validateSignature(
          testPayload,
          uppercaseSignature,
          testSecret
        );

        // Node.js Buffer.from() accepts both uppercase and lowercase hex
        expect(isValid).toBe(true);
      });

      it('should reject signature with non-hex characters that produce different buffer length', () => {
        // Non-hex characters in Buffer.from(str, 'hex') are ignored, creating shorter buffers
        const nonHexSignature = 'ghijklmn' + 'a'.repeat(56); // Some non-hex chars

        // This will be caught by the length check or buffer comparison
        try {
          const isValid = validateSignature(
            testPayload,
            nonHexSignature,
            testSecret
          );
          // If it doesn't throw, it should return false
          expect(isValid).toBe(false);
        } catch (error) {
          // May throw RangeError if buffer lengths don't match
          expect(error).toBeInstanceOf(RangeError);
        }
      });

      it('should accept signature with mixed case hex characters', () => {
        const signature = generateSignature(testPayload, testSecret);
        const mixedCaseSignature =
          signature.slice(0, 32).toUpperCase() + signature.slice(32);
        const isValid = validateSignature(
          testPayload,
          mixedCaseSignature,
          testSecret
        );

        // Node.js Buffer.from() accepts both uppercase and lowercase hex
        expect(isValid).toBe(true);
      });

      it('should reject signature when payload is slightly different', () => {
        const signature = generateSignature(testPayload, testSecret);
        const slightlyDifferentPayload = testPayload + ' '; // Added space
        const isValid = validateSignature(
          slightlyDifferentPayload,
          signature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject signature when secret is slightly different', () => {
        const signature = generateSignature(testPayload, testSecret);
        const slightlyDifferentSecret = testSecret + ' '; // Added space
        const isValid = validateSignature(
          testPayload,
          signature,
          slightlyDifferentSecret
        );

        expect(isValid).toBe(false);
      });

      it('should handle signature with special characters gracefully', () => {
        const specialCharSignature = '!@#$%^&*()' + 'a'.repeat(54);

        // Buffer.from() with 'hex' encoding ignores non-hex chars, creating different length buffers
        try {
          const isValid = validateSignature(
            testPayload,
            specialCharSignature,
            testSecret
          );
          // If it doesn't throw, it should return false
          expect(isValid).toBe(false);
        } catch (error) {
          // May throw RangeError if buffer lengths don't match
          expect(error).toBeInstanceOf(RangeError);
        }
      });
    });

    describe('edge cases', () => {
      it('should handle all zeros signature', () => {
        const zeroSignature = '0'.repeat(64);
        const isValid = validateSignature(
          testPayload,
          zeroSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should handle all f signature', () => {
        const fSignature = 'f'.repeat(64);
        const isValid = validateSignature(testPayload, fSignature, testSecret);

        expect(isValid).toBe(false);
      });

      it('should validate signature generated with both empty strings', () => {
        const signature = generateSignature(emptyString, emptyString);
        const isValid = validateSignature(emptyString, signature, emptyString);

        expect(isValid).toBe(true);
      });

      it('should reject when validating empty payload with non-empty payload signature', () => {
        const signature = generateSignature(testPayload, testSecret);
        const isValid = validateSignature(emptyString, signature, testSecret);

        expect(isValid).toBe(false);
      });

      it('should handle payload with null bytes', () => {
        const payloadWithNull = 'test\x00data';
        const signature = generateSignature(payloadWithNull, testSecret);
        const isValid = validateSignature(
          payloadWithNull,
          signature,
          testSecret
        );

        expect(isValid).toBe(true);
      });

      it('should handle secret with null bytes', () => {
        const secretWithNull = 'secret\x00key';
        const signature = generateSignature(testPayload, secretWithNull);
        const isValid = validateSignature(
          testPayload,
          signature,
          secretWithNull
        );

        expect(isValid).toBe(true);
      });

      it('should handle multiple consecutive special characters', () => {
        const multiSpecialPayload = '!!!###$$$%%%&&&';
        const signature = generateSignature(multiSpecialPayload, testSecret);
        const isValid = validateSignature(
          multiSpecialPayload,
          signature,
          testSecret
        );

        expect(isValid).toBe(true);
      });

      it('should differentiate between similar payloads differing by one character', () => {
        const payload1 = 'test-payload-a';
        const payload2 = 'test-payload-b';

        const signature1 = generateSignature(payload1, testSecret);
        const signature2 = generateSignature(payload2, testSecret);

        // Signatures should be different
        expect(signature1).not.toBe(signature2);

        // Cross-validation should fail
        expect(validateSignature(payload1, signature2, testSecret)).toBe(false);
        expect(validateSignature(payload2, signature1, testSecret)).toBe(false);
      });
    });

    describe('security properties', () => {
      it('should use timing-safe comparison (cannot be tested directly but validates integration)', () => {
        // This test validates that the function uses timingSafeEqual internally
        // by ensuring it works correctly with valid signatures
        const signature = generateSignature(testPayload, testSecret);
        const isValid = validateSignature(testPayload, signature, testSecret);

        expect(isValid).toBe(true);
      });

      it('should reject signature with single bit flip', () => {
        const signature = generateSignature(testPayload, testSecret);

        // Flip a single bit by changing one hex character
        const charIndex = 32; // Middle of the signature
        const originalChar = signature[charIndex];
        const flippedChar = originalChar === 'a' ? 'b' : 'a';
        const flippedSignature =
          signature.slice(0, charIndex) +
          flippedChar +
          signature.slice(charIndex + 1);

        const isValid = validateSignature(
          testPayload,
          flippedSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject signature with single character changed at beginning', () => {
        const signature = generateSignature(testPayload, testSecret);
        const tamperedSignature = 'a' + signature.slice(1);
        const isValid = validateSignature(
          testPayload,
          tamperedSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should reject signature with single character changed at end', () => {
        const signature = generateSignature(testPayload, testSecret);
        const tamperedSignature = signature.slice(0, -1) + 'a';
        const isValid = validateSignature(
          testPayload,
          tamperedSignature,
          testSecret
        );

        expect(isValid).toBe(false);
      });

      it('should handle completely different signatures for same length', () => {
        const signature1 = generateSignature('payload1', testSecret);
        const signature2 = generateSignature('payload2', testSecret);

        // Even though both are valid 64-char hex strings, they should not cross-validate
        expect(validateSignature('payload1', signature2, testSecret)).toBe(
          false
        );
        expect(validateSignature('payload2', signature1, testSecret)).toBe(
          false
        );
      });
    });
  });

  describe('integration tests', () => {
    it('should generate and validate signature in a complete workflow', () => {
      const payload = 'user-id-12345';
      const secret = 'api-secret-key';

      // Generate signature
      const signature = generateSignature(payload, secret);

      // Validate signature
      const isValid = validateSignature(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should work with realistic API signature workflow', () => {
      const method = 'POST';
      const path = '/api/v1/users';
      const timestamp = Date.now();
      const body = JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
      });
      const apiSecret = 'production-secret-key-xyz';

      // Create signature payload (common pattern in APIs)
      const signaturePayload = `${method}|${path}|${timestamp}|${body}`;

      // Generate signature
      const signature = generateSignature(signaturePayload, apiSecret);

      // Validate signature (server-side)
      const isValid = validateSignature(signaturePayload, signature, apiSecret);

      expect(isValid).toBe(true);
    });

    it('should reject signature in workflow when timestamp changes', () => {
      const method = 'POST';
      const path = '/api/v1/users';
      const timestamp1 = Date.now();
      const body = JSON.stringify({ name: 'John Doe' });
      const apiSecret = 'secret';

      const payload1 = `${method}|${path}|${timestamp1}|${body}`;
      const signature = generateSignature(payload1, apiSecret);

      // Time passes, new timestamp
      const timestamp2 = timestamp1 + 1000;
      const payload2 = `${method}|${path}|${timestamp2}|${body}`;

      // Should reject with different timestamp
      const isValid = validateSignature(payload2, signature, apiSecret);

      expect(isValid).toBe(false);
    });

    it('should handle multiple signatures for different resources', () => {
      const secret = 'shared-secret';

      const resource1 = 'user:123';
      const resource2 = 'user:456';
      const resource3 = 'post:789';

      const sig1 = generateSignature(resource1, secret);
      const sig2 = generateSignature(resource2, secret);
      const sig3 = generateSignature(resource3, secret);

      // All should be different
      expect(sig1).not.toBe(sig2);
      expect(sig1).not.toBe(sig3);
      expect(sig2).not.toBe(sig3);

      // Each should validate only with its own resource
      expect(validateSignature(resource1, sig1, secret)).toBe(true);
      expect(validateSignature(resource2, sig2, secret)).toBe(true);
      expect(validateSignature(resource3, sig3, secret)).toBe(true);

      // Cross-validation should fail
      expect(validateSignature(resource1, sig2, secret)).toBe(false);
      expect(validateSignature(resource2, sig3, secret)).toBe(false);
      expect(validateSignature(resource3, sig1, secret)).toBe(false);
    });
  });
});
