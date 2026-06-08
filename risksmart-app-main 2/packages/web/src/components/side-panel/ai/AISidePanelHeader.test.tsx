import {
  act,
  getByRole,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { beforeEach, expect, it as baseTest, vi } from 'vitest';

import { AISidePanelHeader } from '@/components/side-panel/ai/AISidePanelHeader';
import type { SidePanelState } from '@/components/side-panel/useSidePanelStore';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';

interface TestContext {
  store: {
    current: SidePanelState;
  };
}

const it = baseTest.extend<TestContext>({
  //no-dd-sa
  /* eslint-disable-next-line */
  store: async ({}, use) => {
    const { result } = renderHook(() => useSidePanelStore());
    /* eslint-disable-next-line */
    await use(result);
  },
});

describe('AISidePanelHeader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should close the side panel when the close button is clicked', async ({
    store,
  }) => {
    render(<AISidePanelHeader></AISidePanelHeader>);

    const component = screen.getByRole('button');

    await act(async () => {
      // Open anything - we just want to check that the button closes it via the store
      store.current.open('chat', <div></div>, false, false);
    });

    expect(store.current.isOpen).toBe(true);

    await act(async () => {
      component.click();
    });

    expect(store.current.isOpen).toBe(false);
  });

  it('should invoke the close action when passed on clicking the close button', async ({
    store,
  }) => {
    let invoked = false;

    render(
      <AISidePanelHeader
        onClose={() => {
          invoked = true;
        }}
      ></AISidePanelHeader>
    );

    const component = screen.getByRole('button');

    await act(async () => {
      // Open anything - we just want to check that the button closes it via the store
      store.current.open('chat', <div></div>, false, false);

      component.click();
    });

    expect(invoked).toBe(true);
  });

  it('should inject the toolbar buttons into the expected location', () => {
    render(
      <AISidePanelHeader
        toolbarButtons={[
          <button key={'1'}>{'Button 1'}</button>,
          <button key={'2'}>{'Button 2'}</button>,
        ]}
      ></AISidePanelHeader>
    );

    const container: HTMLElement = document.querySelector('div > div')!;

    const button1 = getByRole(container, 'button', { name: 'Button 1' });
    const button2 = getByRole(container, 'button', { name: 'Button 2' });

    expect(button1).not.toBeUndefined();
    expect(button2).not.toBeUndefined();
  });
});
