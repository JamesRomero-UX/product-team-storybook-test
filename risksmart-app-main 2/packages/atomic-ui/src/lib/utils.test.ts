import { describe, expect, it } from 'vitest';

import { cn, getAccessibleTextColor, toTitleCase } from './utils';

describe('cn', () => {
  it('always includes the atomic-ui scope class', () => {
    expect(cn()).toBe('atomic-ui');
  });

  it('merges additional class names', () => {
    expect(cn('px-2', 'py-4')).toBe('atomic-ui px-2 py-4');
  });

  it('handles conditional classes via clsx syntax', () => {
    const shouldHide = false;
    expect(cn('base', shouldHide && 'hidden', 'visible')).toBe(
      'atomic-ui base visible'
    );
  });

  it('deduplicates conflicting tailwind classes (last wins)', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('atomic-ui px-4');
  });

  it('accepts arrays and objects', () => {
    const result = cn(['flex'], { 'items-center': true, hidden: false });
    expect(result).toBe('atomic-ui flex items-center');
  });
});

describe('toTitleCase', () => {
  it('capitalises the first letter of each word', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('lowercases the rest of each word', () => {
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
  });

  it('handles a single word', () => {
    expect(toTitleCase('hello')).toBe('Hello');
  });

  it('returns an empty string unchanged', () => {
    expect(toTitleCase('')).toBe('');
  });
});

describe('getAccessibleTextColor', () => {
  it('returns light text for a dark background', () => {
    expect(getAccessibleTextColor('#000000')).toBe('#ffffff');
  });

  it('returns dark text for a light background', () => {
    expect(getAccessibleTextColor('#ffffff')).toBe('#14143A');
  });

  it('returns dark text for an invalid color', () => {
    expect(getAccessibleTextColor('not-a-color')).toBe('#14143A');
  });

  it('returns dark text for an empty string', () => {
    expect(getAccessibleTextColor('')).toBe('#14143A');
  });

  it('handles named CSS colours', () => {
    expect(getAccessibleTextColor('navy')).toBe('#ffffff');
    expect(getAccessibleTextColor('yellow')).toBe('#14143A');
  });

  it('handles rgb notation', () => {
    expect(getAccessibleTextColor('rgb(0,0,0)')).toBe('#ffffff');
  });
});
