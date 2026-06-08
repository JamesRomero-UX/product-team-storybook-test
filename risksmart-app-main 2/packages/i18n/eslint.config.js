import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import json from '@eslint/json';

// Turn off all rules from the combined config for JSON files
const jsonRuleOverrides = esmConfigTyped.reduce((acc, config) => {
  if (config.rules) {
    Object.keys(config.rules).forEach((rule) => {
      acc[rule] = 'off';
    });
  }
  return acc;
}, {});

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  // JSON-specific configuration
  {
    plugins: {
      json,
    },
    files: ['locales/**/*.json'],
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
      'json/sort-keys': 'error',
      ...jsonRuleOverrides,
    },
  },
];
