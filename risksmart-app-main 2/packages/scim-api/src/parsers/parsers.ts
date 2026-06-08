import type { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';
import * as scimFilter from 'src/parsers/scim-filter';
import {
  mapScimAttributeToHasura,
  mapScimFilterToHasura,
} from 'src/scim/mappings';
import type { ScimFilter } from 'src/scim/types';

export const parseQueryString = (
  queryString: APIGatewayProxyEventQueryStringParameters | undefined
) => {
  try {
    if (!queryString) {
      return {
        filter: {},
        attributes: [],
        offset: 0,
        limit: 20,
      };
    }
    console.debug('queryString', queryString);
    const { filter, attributes, startIndex, count } = queryString;

    // Filter
    const parsedFilter = filter ? scimFilter.parse(filter) : undefined;
    const hasuraFilter = mapScimFilterToHasura(parsedFilter as ScimFilter);

    // Attributes
    const scimAttributes = attributes
      ? attributes.split(',').map((x) => mapScimAttributeToHasura(x))
      : [];

    // Pagination
    const offset =
      startIndex != null
        ? Number(startIndex) <= 0
          ? 0
          : Number(startIndex) - 1
        : 0;
    const limit =
      count != null ? (Number(count) <= 0 ? 0 : Number(count)) : 200;

    // Sorting
    // TBC

    return {
      filter: hasuraFilter,
      attributes: scimAttributes,
      offset,
      limit,
    };
  } catch (error) {
    console.error('Error parsing querystring', error);
    throw error;
  }
};
