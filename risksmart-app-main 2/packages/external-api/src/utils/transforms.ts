import type { Request } from 'express';

export type KnownType =
  | 'risk'
  | 'control'
  | 'issue'
  | 'assessment'
  | 'obligation'
  | 'action'
  | 'indicator'
  | 'third_party'
  | 'enterprise_risk'
  | 'impact'
  | 'acceptance'
  | 'appetite';

const knownResourceTypes = new Map<string, { type: KnownType; path: string }>([
  ['risk', { type: 'risk', path: 'risks' }],
  ['control', { type: 'control', path: 'controls' }],
  ['issue', { type: 'issue', path: 'issues' }],
  ['assessment', { type: 'assessment', path: 'assessments' }],
  ['obligation', { type: 'obligation', path: 'compliance/obligations' }],
  ['action', { type: 'action', path: 'actions' }],
  ['indicator', { type: 'indicator', path: 'indicators' }],
  ['third_party', { type: 'third_party', path: 'third-parties' }],
  ['enterprise_risk', { type: 'enterprise_risk', path: 'enterprise-risks' }],
  ['impact', { type: 'impact', path: 'impacts' }],
  ['acceptance', { type: 'acceptance', path: 'risks/:id/acceptances' }],
  ['appetite', { type: 'appetite', path: 'risks/:id/appetites' }],
]);

const matchDoubleFwdSlashRegex = /(^|[^:])\/{2,}/g;

const createHref = (path: string) => ({
  href: path.replace(matchDoubleFwdSlashRegex, '$1/'),
});

// gets the first defined value or returns undefined.
export const firstDefined = <T>(...vals: (T | null | undefined)[]) =>
  vals.find((v) => v !== null && v !== undefined) as T | undefined;

export const idToResourceReference = (
  id: string,
  type: string,
  hrefPrefix: string
) => ({
  id,
  type,
  ...createHref(`${hrefPrefix}/${encodeURIComponent(id)}`),
});

export const pathResourceReference = (path: string, pathPrefix = '') =>
  createHref(`${pathPrefix ? `${pathPrefix}/` : ''}${path}`);

export const buildUrlSearchParams = (
  req: Request,
  extraParams: Record<string, string | number | null> = {},
  { absolute = false } = {}
) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  const url = new URL(req.originalUrl, origin);

  for (const [key, val] of Object.entries(extraParams)) {
    if (val === undefined || val === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(val));
    }
  }

  return absolute ? url.toString() : `${url.pathname}${url.search}`;
};

export const nodeObjectTypeToResourceType = (type: string) =>
  knownResourceTypes.get(type);
