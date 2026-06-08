import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Input } from './index';

describe('Input', () => {
  it('renders an input with data-slot and default type', () => {
    const html = renderToString(createElement(Input));

    expect(html).toContain('data-slot="input"');
    expect(html).toContain('type="text"');
  });

  it('renders with a custom type', () => {
    const html = renderToString(createElement(Input, { type: 'email' }));

    expect(html).toContain('type="email"');
  });

  it('does not show invalid indicator when aria-invalid is not set', () => {
    const html = renderToString(createElement(Input));

    expect(html).not.toContain('bg-destructive');
  });

  it('shows invalid indicator when aria-invalid is true', () => {
    const html = renderToString(createElement(Input, { 'aria-invalid': true }));

    expect(html).toContain('bg-destructive');
    expect(html).toContain('aria-invalid="true"');
  });

  it('shows invalid indicator when aria-invalid is "true" string', () => {
    const html = renderToString(
      createElement(Input, { 'aria-invalid': 'true' })
    );

    expect(html).toContain('bg-destructive');
  });

  it('does not show invalid indicator when aria-invalid is false', () => {
    const html = renderToString(
      createElement(Input, { 'aria-invalid': false })
    );

    expect(html).not.toContain('bg-destructive');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(Input, { className: 'my-input' })
    );

    expect(html).toContain('my-input');
  });

  it('passes through additional props', () => {
    const html = renderToString(
      createElement(Input, { placeholder: 'Enter text', name: 'field1' })
    );

    expect(html).toContain('placeholder="Enter text"');
    expect(html).toContain('name="field1"');
  });
});
