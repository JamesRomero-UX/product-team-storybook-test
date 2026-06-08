import { act, render, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { SidePanel } from '@/components/side-panel/SidePanel';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';

describe('SidePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the content passed to the store', async () => {
    const { result } = renderHook(() => useSidePanelStore());

    await act(async () => {
      result.current.open('chat', <div>{'Hello'}</div>, false, false);
    });

    render(<SidePanel></SidePanel>);

    expect(document.body.innerHTML.includes('<div>Hello</div>')).toBe(true);
  });
});
