import createHttpError from 'http-errors';
import { z } from 'zod';

import { createPublicMiddleware } from '../utils/createMiddleware';

const HMAC_SHA256_HEX_LENGTH = 64;
const TIMESTAMP_MIN_LENGTH = 13;

export interface SignedURLMiddlewareProps {
  signatureVerifyFn: (signature: string, expiry: number) => boolean;
  failureRedirectLocation?: string;
}

export const signedURLMiddleware = ({
  signatureVerifyFn,
  failureRedirectLocation,
}: SignedURLMiddlewareProps) =>
  createPublicMiddleware((req, res, next) => {
    // if a failure location is provided, redirect location.
    const redirectOrNext = (message = 'Forbidden') => {
      if (failureRedirectLocation) {
        return res.redirect(302, failureRedirectLocation);
      }

      return next(createHttpError(403, message));
    };
    // small schema to validate signature required values.
    const { success, data } = z
      .object({
        sig: z.string().min(HMAC_SHA256_HEX_LENGTH),
        exp: z
          .string()
          .regex(/^\d+$/)
          .min(TIMESTAMP_MIN_LENGTH)
          .max(HMAC_SHA256_HEX_LENGTH + 1),
      })
      .safeParse(req.query);

    if (!success) {
      return redirectOrNext('Signature required');
    }
    if (!signatureVerifyFn(data.sig, parseInt(data.exp, 10))) {
      return redirectOrNext('Invalid signature provided');
    }

    return next();
  });
