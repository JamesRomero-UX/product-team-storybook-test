import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Spinner } from './index';

describe('Spinner', () => {
  it('renders an svg with role status', () => {
    const html = renderToString(createElement(Spinner));

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading"');
    expect(html).toContain('aria-live="polite"');
  });

  it('renders with default md size', () => {
    const html = renderToString(createElement(Spinner));

    expect(html).toContain('animate-spin');
  });

  it('accepts a custom size', () => {
    const html = renderToString(createElement(Spinner, { size: 'lg' }));

    expect(html).toContain('animate-spin');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(Spinner, { className: 'text-red' })
    );

    expect(html).toContain('text-red');
  });

  it('passes through additional svg props', () => {
    const html = renderToString(
      createElement(Spinner, { 'data-testid': 'my-spinner' })
    );

    expect(html).toContain('data-testid="my-spinner"');
  });
});
