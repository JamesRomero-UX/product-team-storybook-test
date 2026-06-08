import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ObjectLevelHeader } from './index';

describe('ObjectLevelHeader', () => {
  it('renders title', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, { title: 'My Header' })
    );

    expect(html).toContain('data-slot="object-level-header"');
    expect(html).toContain('My Header');
  });

  it('renders counter when provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, { title: 'Items', counter: 5 })
    );

    expect(html).toContain('5');
  });

  it('renders counter of 0', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, { title: 'Items', counter: 0 })
    );

    expect(html).toContain('0');
  });

  it('does not render counter when not provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, { title: 'Items' })
    );

    expect(html).not.toContain('(');
  });

  it('renders save button when onSave is provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        onSave: vi.fn(),
      })
    );

    expect(html).toContain('aria-label="Save"');
  });

  it('renders save button as disabled when isObjectDirty is false', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        onSave: vi.fn(),
        isObjectDirty: false,
      })
    );

    expect(html).toContain('disabled');
  });

  it('renders save button as enabled when isObjectDirty is true', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        onSave: vi.fn(),
        isObjectDirty: true,
      })
    );

    expect(html).toContain('aria-label="Save"');
    expect(html).toContain('animate-save-pulse');
  });

  it('renders add action when onAdd is provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        onAdd: vi.fn(),
      })
    );

    expect(html).toContain('aria-label="Add new item"');
  });

  it('renders cancel action when onCancel is provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        onCancel: vi.fn(),
      })
    );

    expect(html).toContain('aria-label="Cancel"');
  });

  it('renders additional actions', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        additionalActions: [
          {
            label: 'Delete',
            iconName: 'trash-01' as const,
            onClick: vi.fn(),
          },
        ],
      })
    );

    expect(html).toContain('aria-label="Delete"');
  });

  it('renders additional actions with custom variant and style', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        additionalActions: [
          {
            label: 'Custom',
            iconName: 'plus' as const,
            onClick: vi.fn(),
            variant: 'primary',
            style: 'ghost',
          },
        ],
      })
    );

    expect(html).toContain('aria-label="Custom"');
  });

  it('renders menu trigger when menuContent is provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        menuContent: createElement('div', null, 'Menu Item'),
      })
    );

    expect(html).toContain('aria-label="More options"');
    // DropdownMenuContent is a popover and not rendered in SSR
  });

  it('does not render menu when menuContent is not provided', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, { title: 'Test' })
    );

    expect(html).not.toContain('More options');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(ObjectLevelHeader, {
        title: 'Test',
        className: 'extra-class',
      })
    );

    expect(html).toContain('extra-class');
  });
});
