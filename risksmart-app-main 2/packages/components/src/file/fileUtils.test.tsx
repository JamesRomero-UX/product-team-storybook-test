import { vi } from 'vitest';

import {
  arrayToCsv,
  getRemovedFiles,
  getRemovedFilesIds,
  hasFileChanges,
  humanFileSize,
} from './fileUtils';
import type { FilesForUpdate } from './types';

describe('fileUtils', () => {
  describe('arrayToCsv', () => {
    it('returns an empty string for no items', () => {
      const result = arrayToCsv([]);
      expect(result).toEqual('');
    });

    it('returns a single number for a number value', () => {
      const result = arrayToCsv([[1]]);
      expect(result).toEqual('1');
    });

    it('returns empty string for undefined', () => {
      const result = arrayToCsv([[undefined]]);
      expect(result).toEqual('');
    });

    it('returns empty string for null', () => {
      const result = arrayToCsv([[null]]);
      expect(result).toEqual('');
    });

    it('comma separates cells', () => {
      const result = arrayToCsv([[1, 1]]);
      expect(result).toEqual('1,1');
    });

    it('newline separates rows', () => {
      const result = arrayToCsv([[1], [1]]);
      expect(result).toEqual('1\r\n1');
    });

    it('returns a single escaped string for a string value', () => {
      const result = arrayToCsv([['1']]);
      expect(result).toEqual('"1"');
    });
  });
  describe('humanFileSize', () => {
    it('returns bytes for small numbers', () => {
      expect(humanFileSize(0)).toBe('0 B');
      expect(humanFileSize(10)).toBe('10 B');
      expect(humanFileSize(1023)).toBe('1023 B');
    });

    it('converts to kB for values >= 1024', () => {
      expect(humanFileSize(1024)).toBe('1.00 kB');
      expect(humanFileSize(1536)).toBe('1.50 kB');
    });

    it('converts to MB, GB, TB correctly', () => {
      expect(humanFileSize(1024 ** 2)).toBe('1.00 MB');
      expect(humanFileSize(1024 ** 3)).toBe('1.00 GB');
      expect(humanFileSize(1024 ** 4)).toBe('1.00 TB');
    });

    it('supports custom decimal precision', () => {
      expect(humanFileSize(1024 ** 2, 0)).toBe('1 MB');
      expect(humanFileSize(1500, 1)).toBe('1.5 kB');
    });
  });

  describe('getRemovedFilesIds', () => {
    it('returns an empty array if no original files were removed', () => {
      const originalFiles = [{ Id: '1' }, { Id: '2' }];
      const selectedFiles = [{ Id: '1' }, { Id: '2' }];
      expect(getRemovedFilesIds(originalFiles, selectedFiles)).toEqual([]);
    });

    it('returns IDs of files that are missing from selectedFiles', () => {
      const originalFiles = [{ Id: '1' }, { Id: '2' }, { Id: '3' }];
      const selectedFiles = [{ Id: '2' }];
      expect(getRemovedFilesIds(originalFiles, selectedFiles)).toEqual([
        '1',
        '3',
      ]);
    });

    it('returns all IDs if selectedFiles is empty', () => {
      const originalFiles = [{ Id: '1' }, { Id: '2' }];
      expect(getRemovedFilesIds(originalFiles, [])).toEqual(['1', '2']);
    });

    it('returns an empty array if both arrays are empty', () => {
      expect(getRemovedFilesIds([], [])).toEqual([]);
    });

    it('ignores undefined IDs in originalFiles', () => {
      const originalFiles = [{ Id: '1' }, { Id: undefined }];
      const selectedFiles = [{ Id: '1' }];
      expect(getRemovedFilesIds(originalFiles, selectedFiles)).toEqual([]);
    });

    it('handles undefined IDs in selectedFiles correctly', () => {
      const originalFiles = [{ Id: '1' }, { Id: '2' }];
      const selectedFiles = [{ Id: undefined }, { Id: '1' }];
      expect(getRemovedFilesIds(originalFiles, selectedFiles)).toEqual(['2']);
    });
  });

  describe('getRemovedFiles', () => {
    const file1 = {
      Id: '1',
      FileName: 'file1.pdf',
      FileSize: 1024,
      ContentType: 'application/pdf',
      CreatedAtTimestamp: '2024-01-01T12:00:00Z',
    };

    const file2 = {
      Id: '2',
      FileName: 'file2.png',
      FileSize: 2048,
      ContentType: 'image/png',
      CreatedAtTimestamp: '2024-02-01T12:00:00Z',
    };

    const file3 = {
      Id: '3',
      FileName: 'file3.docx',
      FileSize: 5120,
      ContentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      CreatedAtTimestamp: '2024-03-01T12:00:00Z',
    };

    it('returns an empty array if all files are selected', () => {
      const original = [file1, file2];
      const selected = [{ Id: '1' }, { Id: '2' }];
      expect(getRemovedFiles(original, selected)).toEqual([]);
    });

    it('returns the removed files if some are not selected', () => {
      const original = [file1, file2, file3];
      const selected = [{ Id: '1' }];
      expect(getRemovedFiles(original, selected)).toEqual([file2, file3]);
    });

    it('returns all files if selectedFiles is empty', () => {
      const original = [file1, file2];
      const selected: { Id: string | undefined }[] = [];
      expect(getRemovedFiles(original, selected)).toEqual([file1, file2]);
    });

    it('returns an empty array if both inputs are empty', () => {
      expect(getRemovedFiles([], [])).toEqual([]);
    });

    it('ignores files with undefined Ids in selectedFiles', () => {
      const original = [file1, file2];
      const selected = [{ Id: undefined }];
      expect(getRemovedFiles(original, selected)).toEqual([file1, file2]);
    });
  });

  describe('hasFileChanges', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('returns true if files have been removed', async () => {
      vi.doMock('./getRemovedFilesIds', () => ({
        getRemovedFilesIds: () => ['1'],
      }));

      const original = [{ Id: '1' }];
      const selected = [] as FilesForUpdate;

      expect(hasFileChanges(original, selected)).toBe(true);
    });

    it('returns true if new files are added', async () => {
      vi.doMock('./getRemovedFilesIds', () => ({
        getRemovedFilesIds: () => [],
      }));

      const original = [{ Id: '1' }];
      const selected = [{ Id: '1' }, new File(['file content'], 'newFile.pdf')];

      expect(hasFileChanges(original, selected)).toBe(true);
    });

    it('returns false if nothing has changed', async () => {
      vi.doMock('./getRemovedFilesIds', () => ({
        getRemovedFilesIds: () => [],
      }));

      const original = [{ Id: '1' }];
      const selected = [{ Id: '1' }];

      expect(hasFileChanges(original, selected)).toBe(false);
    });

    it('returns true if only new File instances exist', async () => {
      vi.doMock('./getRemovedFilesIds', () => ({
        getRemovedFilesIds: () => [],
      }));

      const selected = [
        new File(['abc'], 'new1.txt'),
        new File(['xyz'], 'new2.txt'),
      ];

      expect(hasFileChanges(undefined, selected)).toBe(true);
    });

    it('returns false if both inputs are undefined', async () => {
      vi.doMock('./getRemovedFilesIds', () => ({
        getRemovedFilesIds: () => [],
      }));

      expect(hasFileChanges(undefined, undefined)).toBe(false);
    });
  });
});
