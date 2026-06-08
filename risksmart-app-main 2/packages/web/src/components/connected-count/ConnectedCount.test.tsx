import { useKnockFeed } from '@knocklabs/react';
import { render, screen } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';
import { mocked } from 'storybook/test';
import { vi } from 'vitest';

import ConnectedCount from './ConnectedCount';

vi.mock('@knocklabs/react');

const useKnockFeedMocked = mocked(useKnockFeed);

describe('ConnectedCount', async () => {
  const mockFeedStore = vi.fn();
  beforeEach(() => {
    useKnockFeedMocked.mockReturnValue({
      useFeedStore: mockFeedStore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('renders notification count when countName=notification', async () => {
    const notificationCount = 123;
    mockFeedStore.mockReturnValue(notificationCount);
    render(<ConnectedCount countName={'notification'} />, {
      wrapper: getWrapper([], 'graphql'),
    });

    const result = await screen.queryByText(notificationCount.toString());
    expect(result).toBeInTheDocument();
  });
});
