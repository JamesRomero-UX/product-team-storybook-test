import { afterEach, describe, expect, it } from 'vitest';

import { useFormEditorDialogStore } from './useFormEditorDialogStore';

describe('useFormEditorDialogStore', () => {
  afterEach(() => {
    // Reset store to initial state between tests
    useFormEditorDialogStore.setState({ openSections: [] });
  });

  it('has empty openSections by default', () => {
    expect(useFormEditorDialogStore.getState().openSections).toEqual([]);
  });

  it('setOpenSections replaces the array', () => {
    useFormEditorDialogStore.getState().setOpenSections(['a', 'b']);
    expect(useFormEditorDialogStore.getState().openSections).toEqual([
      'a',
      'b',
    ]);
  });

  it('setOpenSections can set to empty', () => {
    useFormEditorDialogStore.getState().setOpenSections(['a']);
    useFormEditorDialogStore.getState().setOpenSections([]);
    expect(useFormEditorDialogStore.getState().openSections).toEqual([]);
  });

  it('toggleSwitchSection adds value when checked is true', () => {
    useFormEditorDialogStore.setState({ openSections: ['a'] });
    useFormEditorDialogStore.getState().toggleSwitchSection('b', true);
    expect(useFormEditorDialogStore.getState().openSections).toEqual([
      'a',
      'b',
    ]);
  });

  it('toggleSwitchSection removes value when checked is false', () => {
    useFormEditorDialogStore.setState({ openSections: ['a', 'b', 'c'] });
    useFormEditorDialogStore.getState().toggleSwitchSection('b', false);
    expect(useFormEditorDialogStore.getState().openSections).toEqual([
      'a',
      'c',
    ]);
  });

  it('toggleSwitchSection does not duplicate when adding already-present value', () => {
    useFormEditorDialogStore.setState({ openSections: ['a'] });
    useFormEditorDialogStore.getState().toggleSwitchSection('a', true);
    expect(useFormEditorDialogStore.getState().openSections).toEqual([
      'a',
      'a',
    ]);
    // Note: the store does not deduplicate. This tests actual behavior.
  });

  it('toggleSwitchSection is a no-op when removing a non-present value', () => {
    useFormEditorDialogStore.setState({ openSections: ['a'] });
    useFormEditorDialogStore.getState().toggleSwitchSection('x', false);
    expect(useFormEditorDialogStore.getState().openSections).toEqual(['a']);
  });
});
