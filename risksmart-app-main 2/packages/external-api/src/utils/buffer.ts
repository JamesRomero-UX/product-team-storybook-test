export const b64url = (s: string) =>
  Buffer.from(s, 'utf8').toString('base64url');

export const ub64url = (s: string) =>
  Buffer.from(s, 'base64url').toString('utf8');
