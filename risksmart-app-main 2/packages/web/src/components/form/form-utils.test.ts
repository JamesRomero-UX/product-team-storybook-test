import { describe, expect, test } from 'vitest';

import { mergeFormValues, sortByLabel } from './form-utils';

describe('form-utils', () => {
  describe('mergeFormValues', () => {
    test('will ignore undefined values', () => {
      const a = {
        foo: 'a',
        bar: 'b',
      };
      const b = {
        foo: 'b',
        bar: undefined,
      };
      expect(mergeFormValues(a, b)).toStrictEqual({
        foo: 'b',
        bar: 'b',
      });
    });

    test('will ignore null values', () => {
      const a = {
        foo: 'a',
        bar: 'b',
      };
      const b = {
        foo: 'b',
        bar: null,
      };
      expect(mergeFormValues(a, b)).toStrictEqual({
        foo: 'b',
        bar: 'b',
      });
    });

    test('will append additional values values', () => {
      const a = {
        foo: 'a',
        bar: 'b',
      };
      const b = {
        foo: 'b',
        bar: null,
        baz: 'c',
      };
      expect(mergeFormValues(a, b)).toStrictEqual({
        foo: 'b',
        bar: 'b',
        baz: 'c',
      });
    });
    test('will ignore missing keys', () => {
      const a = {
        foo: 'a',
        bar: 'b',
        baz: 'c',
      };
      const b = {
        foo: 'b',
        bar: null,
      };
      expect(mergeFormValues(a, b)).toStrictEqual({
        foo: 'b',
        bar: 'b',
        baz: 'c',
      });
    });
  });

  describe('sortByLabel', () => {
    test.each([
      ['adam.ant', 'maddie.smith', -1], // adam.ant should come before maddie.smith
      ['Public1', 'ReadOnly1', -1], // ReadOnly1 should come before Public1
      ['RiskManager1', 'Standard1', -1], // RiskManager1 should come before Standard1
      ['zephyr.something', 'zephyr.SomethingElse', -1], // zephyr.something should come before zephyr.SomethingElse
      ['banana', 'Apple', 1], // banana should come after Apple
      ['Apple', 'apple', 0], // Case-insensitive comparison should result in equality
      ['apple', 'apple', 0], // Case-insensitive comparison should result in equality
      ['apple', 'banana', -1], // apple should come before banana
    ])('correctly sorts %s and %s', (labelA, labelB, expected) => {
      const result = sortByLabel({ label: labelA }, { label: labelB });
      expect(result).toBe(expected);
    });

    test('sorts given list correctly', () => {
      const unsortedList = [
        { label: 'adam.ant' },
        { label: 'maddie.smith' },
        { label: 'Public1' },
        { label: 'ReadOnly1' },
        { label: 'RiskManager1' },
        { label: 'Standard1' },
        { label: 'zephyr.something' },
      ];

      const sortedList = unsortedList.slice().sort(sortByLabel);
      const expectedList = [
        { label: 'adam.ant' },
        { label: 'maddie.smith' },
        { label: 'Public1' },
        { label: 'ReadOnly1' },
        { label: 'RiskManager1' },
        { label: 'Standard1' },
        { label: 'zephyr.something' },
      ];

      expect(sortedList).toEqual(expectedList);
    });
  });
});
