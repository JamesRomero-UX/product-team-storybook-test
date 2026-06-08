import { allowedFileExtensions } from '@risksmart-app/shared/allowedFileExtensions';

import type { FileOrRelation } from './global';
import { FileOrRelationSchema } from './global';

describe('global', () => {
  describe('FileOrRelationSchema', () => {
    it.each(allowedFileExtensions)(
      'should be valid when file extension is %s',
      (ext) => {
        const file = new File([''], `filename.${ext}`, {
          type: 'text/plain',
        });
        const input: FileOrRelation = file;
        expect(FileOrRelationSchema.safeParse(input).success).toEqual(true);
      }
    );

    it('should be valid when file extension is uppercase', () => {
      const file = new File([''], 'filename.JPG', {
        type: 'text/plain',
      });
      const input: FileOrRelation = file;
      expect(FileOrRelationSchema.safeParse(input).success).toEqual(true);
    });

    it('should be invalid when file extension is unsupported', () => {
      const file = new File([''], 'filename.unsupported', {
        type: 'text/plain',
      });
      const input: FileOrRelation = file;
      expect(FileOrRelationSchema.safeParse(input).success).toEqual(false);
    });

    it('should be valid when file size is less than 1GB', () => {
      const file = new File([''], 'filename.jpg', {
        type: 'text/plain',
      });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 * 1024 - 1 }); // 1GB - 1 byte
      const input: FileOrRelation = file;
      expect(FileOrRelationSchema.safeParse(input).success).toEqual(true);
    });

    it('should be invalid when file size is greater than 1GB', () => {
      const file = new File([''], 'filename.jpg', {
        type: 'text/plain',
      });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 * 1024 + 1 }); // 1GB + 1 byte
      const input: FileOrRelation = file;
      expect(FileOrRelationSchema.safeParse(input).success).toEqual(false);
    });
  });
});
