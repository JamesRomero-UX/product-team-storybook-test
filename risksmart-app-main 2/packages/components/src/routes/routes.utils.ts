import { useParams } from 'react-router';

import { PageNotFound } from '../errors/errors';

const base = new URL(`${window.location.protocol}//${window.location.host}`);
export function isInternal(url: string): boolean {
  return new URL(url, base).hostname === base.hostname;
}

export const isGuid = (id: string | undefined) =>
  /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/i.test(
    id || ''
  );

/**
 * Gets a guid query string parameter. Throws an error if the param does not
 * exist. Shows not found page if param value is not a guid
 *
 * @param paramName
 */
export const useGetGuidParam = (paramName: string) => {
  const params = useParams();
  const value = params[paramName];

  if (!value) {
    throw new Error(`Missing ${paramName} param`);
  }

  if (!isGuid(value) && value !== 'latest') {
    throw new PageNotFound();
  }

  return value;
};

/**
 * Gets a guid query string parameter. Throws an error if the param does not
 * exist. Shows not found page if param value is not a guid
 *
 * @param paramName
 */
export const useGetOptionalGuidParam = (paramName: string) => {
  const params = useParams();
  const value = params[paramName];
  if (!value) {
    return undefined;
  }

  if (!isGuid(value)) {
    throw new PageNotFound(`Invalid guid ${value}`);
  }

  return value;
};

export const useGetUserIdParam = (paramName: string) => {
  const params = useParams();
  const value = params[paramName];

  if (!value) {
    throw new PageNotFound(`Missing ${paramName} param`);
  }

  return value;
};

export const useGetNumberParam = (paramName: string) => {
  const params = useParams();
  const value = params[paramName];

  if (!value) {
    throw new PageNotFound(`Missing ${paramName} param`);
  }

  if (isNaN(Number(value))) {
    throw new PageNotFound(`Invalid ${paramName} param`);
  }

  return Number(value);
};
