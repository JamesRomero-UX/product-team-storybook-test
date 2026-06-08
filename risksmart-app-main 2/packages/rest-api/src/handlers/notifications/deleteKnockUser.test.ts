import type { Context, SQSEvent } from 'aws-lambda';
import type { User } from 'generated/graphql';
import { stub } from 'src/testing/stub';
import { describe, vi } from 'vitest';

import type { DataChangeEvent } from '../events/DataChangeEvent';
import { handler } from './deleteKnockUser';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      KNOCK_SECRET_KEY: 'mock-knock-secret-key',
    },
  };
});

const deleteSpy = vi.fn();
vi.mock('@knocklabs/node', () => {
  return {
    Knock: vi.fn().mockImplementation(() => ({
      users: {
        delete: deleteSpy,
      },
    })),
  };
});

beforeEach(() => {
  deleteSpy.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('deleteKnockUser', () => {
  describe('When a user is deleted in hasura', () => {
    it('should delete the user in knock', async () => {
      const result = handler(
        stub<SQSEvent>({
          Records: [
            {
              messageId: 'message-id',
              body: JSON.stringify({
                detail: <DataChangeEvent<User, 'user'>>{
                  table: { name: 'user', schema: 'auth' },
                  trigger: { name: 'user' },
                  event: {
                    op: 'DELETE',
                    data: {
                      old: {
                        Id: 'existing-user-id',
                        Email: 'old-email@user.com',
                      },
                    },
                  },
                },
              }),
            },
          ],
        }),
        stub<Context>({}),
        vi.fn()
      );

      await expect(result).resolves.toBeUndefined();
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('existing-user-id');
    });
    describe('And knock responds with a rate limit (429) error', () => {
      it('should retry with exponential backoff and succeed on subsequent attempt', async () => {
        const tooManyRequestsError: { status: number; message: string } = {
          status: 429,
          message: 'You are not allowed to perform any more requests',
        };
        deleteSpy
          .mockRejectedValueOnce(tooManyRequestsError)
          .mockResolvedValueOnce(undefined);

        const result = handler(
          stub<SQSEvent>({
            Records: [
              {
                messageId: 'message-id',
                body: JSON.stringify({
                  detail: <DataChangeEvent<User, 'user'>>{
                    table: { name: 'user', schema: 'auth' },
                    trigger: { name: 'user' },
                    event: {
                      op: 'DELETE',
                      data: {
                        old: {
                          Id: 'existing-user-id',
                          Email: 'old-email@user.com',
                        },
                      },
                    },
                  },
                }),
              },
            ],
          }),
          stub<Context>({}),
          vi.fn()
        );

        await expect(result).resolves.toBeUndefined();
        expect(deleteSpy).toHaveBeenCalledTimes(2);
      });
    });
    describe('And knock 429 responses exceed the maximum retries', () => {
      it('should retry with exponential backoff and succeed on subsequent attempt', async () => {
        const tooManyRequestsError: { status: number; message: string } = {
          status: 429,
          message: 'You are not allowed to perform any more requests',
        };
        deleteSpy
          .mockRejectedValueOnce(tooManyRequestsError)
          .mockRejectedValueOnce(tooManyRequestsError)
          .mockRejectedValueOnce(tooManyRequestsError);

        const result = handler(
          stub<SQSEvent>({
            Records: [
              {
                messageId: 'message-id',
                body: JSON.stringify({
                  detail: <DataChangeEvent<User, 'user'>>{
                    table: { name: 'user', schema: 'auth' },
                    trigger: { name: 'user' },
                    event: {
                      op: 'DELETE',
                      data: {
                        old: {
                          Id: 'existing-user-id',
                          Email: 'old-email@user.com',
                        },
                      },
                    },
                  },
                }),
              },
            ],
          }),
          stub<Context>({}),
          vi.fn()
        );

        await expect(result).rejects.toThrow(
          'You are not allowed to perform any more requests'
        );
        expect(deleteSpy).toHaveBeenCalledTimes(3);
      });
    });
    describe('And knock responds with a non retryable error', () => {
      it('should throw the error without retrying', async () => {
        const badRequestError: { status: number; message: string } = {
          status: 400,
          message: 'Bad Request',
        };
        deleteSpy.mockRejectedValueOnce(badRequestError);

        const result = handler(
          stub<SQSEvent>({
            Records: [
              {
                messageId: 'message-id',
                body: JSON.stringify({
                  detail: <DataChangeEvent<User, 'user'>>{
                    table: { name: 'user', schema: 'auth' },
                    trigger: { name: 'user' },
                    event: {
                      op: 'DELETE',
                      data: {
                        old: {
                          Id: 'existing-user-id',
                          Email: 'old-email@user.com',
                        },
                      },
                    },
                  },
                }),
              },
            ],
          }),
          stub<Context>({}),
          vi.fn()
        );

        await expect(result).rejects.toThrow('Bad Request');
        expect(deleteSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('When invoked with a user insert event', () => {
    it('should throw an error and not delete the user in knock', async () => {
      const result = handler(
        <SQSEvent>{
          Records: [
            {
              messageId: 'sqs-message-id',
              body: JSON.stringify({
                detail: <DataChangeEvent<User, 'user'>>{
                  id: 'event-id',
                  table: { name: 'user', schema: 'auth' },
                  trigger: { name: 'user' },
                  event: {
                    op: 'INSERT',
                    data: {
                      new: {
                        Id: 'new-user-id',
                        Email: 'new-user@user.com',
                      },
                      old: null,
                    },
                  },
                },
              }),
            },
          ],
        },
        stub<Context>({}),
        vi.fn()
      );

      await expect(result).rejects.toThrow('Only DELETE events are supported');
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
  describe('When invoked with a user update event', () => {
    it('should throw an error and not delete the user in knock', async () => {
      const result = handler(
        stub<SQSEvent>({
          Records: [
            {
              messageId: 'message-id',
              body: JSON.stringify({
                detail: <DataChangeEvent<User, 'user'>>{
                  table: { name: 'user', schema: 'auth' },
                  trigger: { name: 'user' },
                  event: {
                    op: 'UPDATE',
                    data: {
                      new: {
                        Id: 'existing-user-id',
                        Email: 'new-email@user.com',
                      },
                      old: {
                        Id: 'existing-user-id',
                        Email: 'old-email@user.com',
                      },
                    },
                  },
                },
              }),
            },
          ],
        }),
        stub<Context>({}),
        vi.fn()
      );

      await expect(result).rejects.toThrow('Only DELETE events are supported');
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
  describe('When invoked with an event from a different table', () => {
    it('should throw an error and not delete the user in knock', async () => {
      const result = handler(
        stub<SQSEvent>({
          Records: [
            {
              messageId: 'message-id',
              body: JSON.stringify({
                detail: {
                  table: { name: 'organisation', schema: 'auth' },
                  trigger: { name: 'user' },
                  event: {
                    op: 'DELETE',
                    data: {
                      old: {
                        Id: 'existing-user-id',
                        Email: 'old-email@user.com',
                      },
                    },
                  },
                },
              }),
            },
          ],
        }),
        stub<Context>({}),
        vi.fn()
      );

      await expect(result).rejects.toThrow('Only user events are supported');
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
});
