import { Change_Request_File_Operation_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';

import { mapChanges } from './mapChanges';

describe('mapChanges', () => {
  it('creates to and from fields for every top level property', () => {
    const from = {
      a: '1',
      b: '2',
    };
    const to = {
      a: '1.1',
      b: '2.2',
    };
    const changes = mapChanges(from, to);
    expect(changes).toEqual({
      a: {
        from: '1',
        to: '1.1',
      },
      b: {
        from: '2',
        to: '2.2',
      },
    });
  });

  it('creates to and from fields for nested level property', () => {
    const from = {
      a: {
        x: '1',
        y: '2',
      },
    };
    const to = {
      a: {
        x: '1.1',
        y: '2.1',
      },
    };
    const changes = mapChanges(from, to);
    expect(changes).toEqual({
      a: {
        from: {
          x: '1',
          y: '2',
        },
        to: {
          x: '1.1',
          y: '2.1',
        },
      },
      'a.x': {
        from: '1',
        to: '1.1',
      },
      'a.y': {
        from: '2',
        to: '2.1',
      },
    });
  });

  describe('mapChanges - file changes', () => {
    const originalFile = { Id: '1', Name: 'original.pdf' };
    const addedFile = {
      file: { Id: '2', Name: 'added.pdf' },
      ChangeRequestFileOperation: Change_Request_File_Operation_Enum.Added,
    };
    const removedFile = {
      file: { Id: '1', Name: 'original.pdf' },
      ChangeRequestFileOperation: Change_Request_File_Operation_Enum.Removed,
    };

    it('returns added file in .files.to and leaves .files.from unchanged', () => {
      const from = {
        files: [originalFile],
      };
      const to = {
        files: [addedFile],
      };

      const result = mapChanges(from, to);

      expect(result.files).toEqual({
        from: [originalFile],
        to: [originalFile, addedFile.file],
      });
    });

    it('removes a file properly from .files.to', () => {
      const from = {
        files: [originalFile],
      };
      const to = {
        files: [removedFile],
      };

      const result = mapChanges(from, to);

      expect(result.files).toEqual({
        from: [originalFile],
        to: [],
      });
    });

    it('handles both added and removed files together', () => {
      const from = {
        files: [originalFile],
      };
      const to = {
        files: [removedFile, addedFile],
      };

      const result = mapChanges(from, to);

      expect(result.files).toEqual({
        from: [originalFile],
        to: [addedFile.file],
      });
    });

    it('does not consider files changed if to.files is empty (no change requests)', () => {
      const from = {
        files: [originalFile],
      };
      const to = {
        files: [],
      };

      const result = mapChanges(from, to);

      expect(result.files).toEqual({
        from: [originalFile],
        to: [originalFile],
      });
    });

    it('handles no files in either input', () => {
      const result = mapChanges({}, {});
      expect(result).toEqual({});
    });
  });
});
