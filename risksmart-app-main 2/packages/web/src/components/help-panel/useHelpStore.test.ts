import { act, renderHook } from '@testing-library/react';

import { useHelpStore } from './useHelpStore';

const initialHelpStoreState = useHelpStore.getState();

const resetStores = () => {
  useHelpStore.setState(initialHelpStoreState, true);
};

describe('useHelpStore', () => {
  beforeEach(() => {
    resetStores();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useHelpStore());

    expect(result.current.formFieldHelpContent).toEqual({});
    expect(result.current.translationKey).toBe('');
    expect(result.current.contentId).toBeNull();
    expect(result.current.summaryHelpContent).toEqual([]);
  });

  it('should update translationKey', () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey('new-key');
    });

    expect(result.current.translationKey).toBe('new-key');
  });

  it('should update contentId', () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setContentId('new-id');
    });

    expect(result.current.contentId).toBe('new-id');
  });

  it('should update summaryHelpContent', () => {
    const { result } = renderHook(() => useHelpStore());
    const newContent = [{ title: 'Title', content: 'Content' }];

    act(() => {
      result.current.setSummaryHelpContent(newContent);
    });

    expect(result.current.summaryHelpContent).toEqual(newContent);
  });

  it('should add and remove field help content', () => {
    const { result } = renderHook(() => useHelpStore());
    const fieldId = 'field1';
    const helpContent = { title: 'Title', content: 'Content' };

    act(() => {
      result.current.addFieldHelp(fieldId, helpContent);
    });

    expect(result.current.formFieldHelpContent[fieldId]).toEqual(helpContent);

    act(() => {
      result.current.removeFieldHelp(fieldId);
    });

    expect(result.current.formFieldHelpContent[fieldId]).toBeUndefined();
  });

  it('should correctly determine if there is help content', () => {
    const { result } = renderHook(() => useHelpStore());
    const fieldId = 'field1';
    const helpContent = { title: 'Title', content: 'Content' };

    expect(result.current.getHasHelpContent()).toBe(false);

    act(() => {
      result.current.addFieldHelp(fieldId, helpContent);
    });

    expect(result.current.getHasHelpContent()).toBe(true);

    act(() => {
      result.current.removeFieldHelp(fieldId);
    });

    expect(result.current.getHasHelpContent()).toBe(false);

    const summaryContent = [
      { title: 'Summary Title', content: 'Summary Content' },
    ];

    act(() => {
      result.current.setSummaryHelpContent(summaryContent);
    });

    expect(result.current.getHasHelpContent()).toBe(true);
  });
});
