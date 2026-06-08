import { formatUrl } from './linkUtils';

describe('linkUtils', () => {
  describe('formatUrl', () => {
    it('returns an empty string for no url', () => {
      const result = formatUrl('');
      expect(result).toEqual('');
    });

    it('returns the https url if it starts with http://', () => {
      const result = formatUrl('http://example.com');
      expect(result).toEqual('https://example.com');
    });

    it('returns the https url if it starts with HTTP://', () => {
      const result = formatUrl('HTTP://example.com');
      expect(result).toEqual('https://example.com');
    });

    it('returns the url if it starts with https://', () => {
      const result = formatUrl('https://example.com');
      expect(result).toEqual('https://example.com');
    });

    it('adds https:// prefix if url does not start with http:// or https://', () => {
      const result = formatUrl('example.com');
      expect(result).toEqual('https://example.com');
    });

    it('adds https:// prefix if url does not start with http:// or https:// and contains a path', () => {
      const result = formatUrl('example.com/path');
      expect(result).toEqual('https://example.com/path');
    });

    it('adds https:// prefix if url does not start with http:// or https:// and contains query parameters', () => {
      const result = formatUrl('example.com?param1=value1&param2=value2');
      expect(result).toEqual('https://example.com?param1=value1&param2=value2');
    });

    it('adds https:// prefix if url does not start with http:// or https:// and contains a fragment', () => {
      const result = formatUrl('example.com#fragment');
      expect(result).toEqual('https://example.com#fragment');
    });

    it('returns the same url if it already starts with https:// and contains a path, query parameters and a fragment', () => {
      const result = formatUrl(
        'https://example.com/path?param1=value1&param2=value2#fragment'
      );
      expect(result).toEqual(
        'https://example.com/path?param1=value1&param2=value2#fragment'
      );
    });
  });
});
