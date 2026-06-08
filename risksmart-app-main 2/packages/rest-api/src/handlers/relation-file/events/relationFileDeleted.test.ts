import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { RelationFile } from 'generated/graphql';
import { deleteFile } from 'src/services/file/fileService';
import { getFileRelatedFileCount } from 'src/services/relation-file/relationFileService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getHasuraAdminClient } from '../../../adminGraphqlClient';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
import type { RisksmartDetailType } from '../../notifications/eventBridgeUtils';
import { handler } from './relationFileDeleted';

vi.mock('src/adminGraphqlClient');
vi.mock('src/services/file/fileService');
vi.mock('src/services/relation-file/relationFileService');
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const deleteFileMock = vi.mocked(deleteFile);
const getFileRelatedFileCountMock = vi.mocked(getFileRelatedFileCount);
const getHasuraAdminClientMock = vi.mocked(getHasuraAdminClient);
describe('Relation File Deleted', () => {
  describe('handler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      getHasuraAdminClientMock.mockReturnValue(hasuraMock);
    });

    it('should terminate when request is invalid: missing fileId', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {},
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).not.toHaveBeenCalled();
    });

    it('should terminate when request is invalid: incorrect table', async () => {
      await expect(
        handler(
          stub<
            EventBridgeEvent<
              RisksmartDetailType.DataChanged,
              DataChangeEvent<RelationFile, 'relation_file'>
            >
          >({
            detail: {
              table: { name: 'file' as unknown as 'relation_file' },
              event: {
                op: 'DELETE',
                data: {
                  old: {
                    FileId: 'File1',
                  },
                },
              },
            },
          }),
          stub<Context>({}),
          vi.fn()
        )
      ).rejects.toThrow('Only relation file deletion events are supported');

      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).not.toHaveBeenCalled();
    });

    it('should terminate when request is invalid: incorrect op', async () => {
      await expect(
        handler(
          stub<
            EventBridgeEvent<
              RisksmartDetailType.DataChanged,
              DataChangeEvent<RelationFile, 'relation_file'>
            >
          >({
            detail: {
              table: { name: 'relation_file' },
              event: {
                op: 'UPDATE',
                data: {
                  old: {
                    FileId: 'File1',
                  },
                },
              },
            },
          }),
          stub<Context>({}),
          vi.fn()
        )
      ).rejects.toThrow('Only relation file deletion events are supported');

      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).not.toHaveBeenCalled();
    });

    it('should terminate when undefined returned from file relation query', async () => {
      getFileRelatedFileCountMock.mockResolvedValue(undefined);
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  FileId: 'File1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(getFileRelatedFileCountMock).toHaveBeenCalled();
      expect(deleteFileMock).not.toHaveBeenCalled();
    });
    it('should terminate when empty array returned from file relation query', async () => {
      getFileRelatedFileCountMock.mockResolvedValue([]);
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  FileId: 'File1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(getFileRelatedFileCountMock).toHaveBeenCalled();
      expect(deleteFileMock).not.toHaveBeenCalled();
    });

    it('should terminate when file query returns null for aggregate', async () => {
      getFileRelatedFileCountMock.mockResolvedValue([
        {
          Id: 'File1',
          relationFile_aggregate: {},
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  FileId: 'File1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).toHaveBeenCalled();
    });

    it('should terminate when file query returns undefined for aggregate', async () => {
      getFileRelatedFileCountMock.mockResolvedValue([
        {
          Id: 'File1',
          relationFile_aggregate: {
            aggregate: undefined,
          },
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  FileId: 'File1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).toHaveBeenCalled();
    });

    it('should terminate when file query returns count greater than 0 for aggregate', async () => {
      getFileRelatedFileCountMock.mockResolvedValue([
        {
          Id: 'File1',
          relationFile_aggregate: {
            aggregate: {
              count: 1,
            },
          },
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  FileId: 'File1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).toHaveBeenCalled();
    });

    it('should delete the file when file query returns count of 0 for aggregate', async () => {
      getFileRelatedFileCountMock.mockResolvedValue([
        {
          Id: 'File1',
          relationFile_aggregate: {
            aggregate: {
              count: 0,
            },
          },
        },
      ]);
      await handler(
        stub<
          EventBridgeEvent<
            RisksmartDetailType.DataChanged,
            DataChangeEvent<RelationFile, 'relation_file'>
          >
        >({
          detail: {
            table: { name: 'relation_file' },
            event: {
              op: 'DELETE',
              data: {
                old: {
                  FileId: 'File1',
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(deleteFileMock).toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).toHaveBeenCalled();
      expect(getFileRelatedFileCountMock).toBeCalledWith(hasuraMock, {
        FileId: 'File1',
      });
    });
  });
});
