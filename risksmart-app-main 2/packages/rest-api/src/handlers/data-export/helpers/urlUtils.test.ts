import { describe, expect, it } from 'vitest';

import { isUrl } from './urlUtils';

describe('isUrl', () => {
  describe('should return true for valid URLs', () => {
    it('should detect HTTP URLs', () => {
      expect(isUrl('http://example.com')).toBe(true);
      expect(isUrl('HTTP://EXAMPLE.COM')).toBe(true);
      expect(isUrl('http://example.com/path?query=value')).toBe(true);
    });

    it('should detect HTTPS URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('HTTPS://EXAMPLE.COM')).toBe(true);
      expect(isUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('should detect FTP URLs', () => {
      expect(isUrl('ftp://ftp.example.com')).toBe(true);
      expect(isUrl('FTP://FTP.EXAMPLE.COM')).toBe(true);
      expect(isUrl('ftp://ftp.example.com/folder')).toBe(true);
    });

    it('should detect www URLs', () => {
      expect(isUrl('www.example.com')).toBe(true);
      expect(isUrl('WWW.EXAMPLE.COM')).toBe(true);
      expect(isUrl('www.example.com/path')).toBe(true);
    });

    it('should detect URLs with various protocols', () => {
      expect(isUrl('s3://bucket/folder')).toBe(true);
      expect(isUrl('file://localhost/path')).toBe(true);
      expect(isUrl('ssh://server.com')).toBe(true);
      expect(isUrl('git://github.com/repo')).toBe(true);
      expect(isUrl('custom-protocol://resource')).toBe(true);
    });

    it('should detect URLs with whitespace', () => {
      expect(isUrl('  https://example.com  ')).toBe(true);
      expect(isUrl('\t http://example.com \n')).toBe(true);
      expect(isUrl(' www.example.com ')).toBe(true);
    });

    it('should detect malformed URLs correctly', () => {
      expect(isUrl('http://')).toBe(true); // Matches the protocol pattern
      expect(isUrl('https://')).toBe(true);
      expect(isUrl('ftp://')).toBe(true);
      expect(isUrl('://missing-protocol')).toBe(true);
    });

    it('should detect mixed case protocols', () => {
      expect(isUrl('HtTp://example.com')).toBe(true);
      expect(isUrl('HtTpS://example.com')).toBe(true);
      expect(isUrl('FtP://example.com')).toBe(true);
      expect(isUrl('WwW.example.com')).toBe(true);
    });

    it('should detect special characters in paths', () => {
      expect(isUrl('https://example.com/path with spaces')).toBe(true);
      expect(isUrl('https://example.com/path-with-dashes')).toBe(true);
      expect(isUrl('https://example.com/path_with_underscores')).toBe(true);
      expect(isUrl('https://example.com/path%20encoded')).toBe(true);
    });
  });

  describe('should return false for non-URLs', () => {
    it('should not detect simple folder paths', () => {
      expect(isUrl('folder')).toBe(false);
      expect(isUrl('folder/subfolder')).toBe(false);
      expect(isUrl('/root/folder')).toBe(false);
      expect(isUrl('./relative/path')).toBe(false);
      expect(isUrl('../parent/path')).toBe(false);
    });

    it('should not detect file paths with extensions', () => {
      expect(isUrl('document.pdf')).toBe(false);
      expect(isUrl('folder/file.txt')).toBe(false);
      expect(isUrl('/path/to/file.json')).toBe(false);
      expect(isUrl('C:\\Windows\\System32')).toBe(false);
    });

    it('should not detect strings that contain URL-like text but are not URLs', () => {
      expect(isUrl('my-http-folder')).toBe(false);
      expect(isUrl('folder_with_www_in_name')).toBe(false);
      expect(isUrl('description about https protocol')).toBe(false);
      expect(isUrl('file-ftp-backup')).toBe(false);
    });

    it('should handle empty and null values', () => {
      expect(isUrl(null)).toBe(false);
      expect(isUrl(undefined)).toBe(false);
      expect(isUrl('')).toBe(false);
      expect(isUrl('   ')).toBe(false);
    });
  });
});
