import { expressjwt, type Params } from 'express-jwt';

interface JWTProps {
  excludePaths?: string[];
}

export function createJWTMiddleware(params: Params, props: JWTProps = {}) {
  return expressjwt(params).unless({ path: props?.excludePaths });
}
