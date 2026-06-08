import { act, renderHook } from '@testing-library/react';

import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';
describe('useSidePanelStore', () => {
  describe('basic state management', () => {
    it('should initialise with default state', () => {
      const { result } = renderHook(() => useSidePanelStore());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isWidePanel).toBe(false);
      expect(result.current.closeOnLocationChange).toBe(true);
      expect(result.current.content).toBeUndefined();
    });

    it('should show the panel when it has been opened for content', () => {
      const { result } = renderHook(() => useSidePanelStore());

      act(() => {
        result.current.open('chat', '<div></div>', false, true);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.content).toBe('<div></div>');
      expect(result.current.closeOnLocationChange).toBe(false);
      expect(result.current.isWidePanel).toBe(true);
    });

    it('should show the panel is closed with no content when it has been closed', () => {
      const { result } = renderHook(() => useSidePanelStore());

      act(() => {
        // Open it first so we can be sure the values get reset
        result.current.open('chat', '<div></div>', false, true);
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.content).toBeUndefined();
    });

    it('should not close the side panel that was opened with not close set when the location changes', () => {
      const { result } = renderHook(() => useSidePanelStore());

      act(() => {
        result.current.open('chat', '<div></div>', false, true);
        result.current.locationChanged();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close the side panel that was opened with not close not set when the location changes', () => {
      const { result } = renderHook(() => useSidePanelStore());

      act(() => {
        result.current.open('chat', '<div></div>', true, true);
        result.current.locationChanged();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.content).toBeUndefined();
    });

    it('should not open the side panel when the location changes and the last panel does not close on location change', () => {
      const { result } = renderHook(() => useSidePanelStore());

      act(() => {
        result.current.open('chat', '<div></div>', false, true);
        result.current.close();
        result.current.locationChanged();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });
});
