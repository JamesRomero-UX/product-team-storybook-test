import type { Context, SQSEvent } from 'aws-lambda';
import type { User } from 'generated/graphql';
import { stub } from 'src/testing/stub';
import { describe, vi } from 'vitest';

import type { DataChangeEvent } from '../events/DataChangeEvent';
import { handler } from './identifyKnockUser';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      KNOCK_SECRET_KEY: 'mock-knock-secret-key',
    },
  };
});

const identifySpy = vi.fn();
vi.mock('@knocklabs/node', () => {
  return {
    Knock: vi.fn().mockImplementation(() => ({
      users: {
        identify: identifySpy,
      },
    })),
  };
});

beforeEach(() => {
  identifySpy.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('identifyKnockUser', () => {
  describe('When a user is created in hasura', () => {
    describe('And the user has an email address', () => {
      it('should identify the user in knock', async () => {
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

        await expect(result).resolves.toBeUndefined();
        expect(identifySpy).toHaveBeenCalledTimes(1);
        expect(identifySpy).toHaveBeenCalledWith('new-user-id', {
          email: 'new-user@user.com',
        });
      });
    });
    describe('And the user does not have an email address', () => {
      it('should not identify the user in knock', async () => {
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
                      op: 'INSERT',
                      data: {
                        new: {
                          Id: 'new-user-id',
                          Email: null,
                        },
                        old: null,
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
        expect(identifySpy).not.toHaveBeenCalled();
      });
    });
    describe('And knock responds with a rate limit (429) error', () => {
      it('should retry with exponential backoff and succeed on subsequent attempt', async () => {
        const error: { status: number; message: string } = {
          status: 429,
          message: 'You are not allowed to perform any more requests',
        };
        identifySpy
          .mockRejectedValueOnce(error)
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
                      op: 'INSERT',
                      data: {
                        new: { Id: 'user-id', Email: 'user@example.com' },
                        old: null,
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
        expect(identifySpy).toHaveBeenCalledTimes(2);
      });
    });
    describe('And knock 429 responses exceed the maximum retries', () => {
      it('should retry with exponential backoff and succeed on subsequent attempt', async () => {
        const error: { status: number; message: string } = {
          status: 429,
          message: 'You are not allowed to perform any more requests',
        };
        identifySpy
          .mockRejectedValueOnce(error)
          .mockRejectedValueOnce(error)
          .mockRejectedValueOnce(error);

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
                      op: 'INSERT',
                      data: {
                        new: { Id: 'user-id', Email: 'user@example.com' },
                        old: null,
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
        expect(identifySpy).toHaveBeenCalledTimes(3);
      });
    });
    describe('And knock responds with a non retryable error', () => {
      it('should throw the error without retrying', async () => {
        const error: { status: number; message: string } = {
          status: 400,
          message: 'Bad Request',
        };
        identifySpy.mockRejectedValueOnce(error);

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
                      op: 'INSERT',
                      data: {
                        new: { Id: 'user-id', Email: 'user@example.com' },
                        old: null,
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
        expect(identifySpy).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('When a user is updated in hasura', () => {
    describe('And the user has an email address', () => {
      describe('And the email address is different from the previous email address', () => {
        it('should identify the user in knock', async () => {
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

          await expect(result).resolves.toBeUndefined();
          expect(identifySpy).toHaveBeenCalledTimes(1);
          expect(identifySpy).toHaveBeenCalledWith('existing-user-id', {
            email: 'new-email@user.com',
          });
        });
      });
    });
    describe('And the user does not have an email address', () => {
      it('should not identify the user in knock', async () => {
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
                          Id: 'exiting-user-id',
                          Email: null,
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

        await expect(result).resolves.toBeUndefined();
        expect(identifySpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('When invoked with a user delete event', () => {
    it('should throw an error and not identify the user in knock', async () => {
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
        'Only INSERT and UPDATE events are supported'
      );
      expect(identifySpy).not.toHaveBeenCalled();
    });
  });
  describe('When invoked with an event from a different table', () => {
    it('should throw an error and not identify the user in knock', async () => {
      const result = handler(
        <SQSEvent>{
          Records: [
            {
              messageId: 'sqs-message-id',
              body: JSON.stringify({
                detail: {
                  id: 'event-id',
                  table: { name: 'organisation', schema: 'auth' },
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

      await expect(result).rejects.toThrow('Only user events are supported');
      expect(identifySpy).not.toHaveBeenCalled();
    });
  });
});
