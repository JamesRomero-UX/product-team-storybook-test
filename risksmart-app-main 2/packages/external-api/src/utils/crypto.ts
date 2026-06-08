import { createHmac, timingSafeEqual } from 'crypto';

// Generates an HMAC-SHA256 signature for a given payload using a secret key.
export const generateSignature = (payload: string, secret: string): string => {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);

  return hmac.digest('hex');
};

// Validates a signature against a payload and secret key using timing-safe comparison
export const validateSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = generateSignature(payload, secret);

  // Use timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};
