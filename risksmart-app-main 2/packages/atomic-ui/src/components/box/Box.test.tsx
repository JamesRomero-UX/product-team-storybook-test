import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Box, BoxContent, BoxTitle } from './index';

describe('Box', () => {
  it('renders with data-slot', () => {
    const html = renderToString(
      createElement(Box, null, createElement('span', null, 'hello'))
    );

    expect(html).toContain('data-slot="box"');
    expect(html).toContain('hello');
  });

  it('merges custom className', () => {
    const html = renderToString(createElement(Box, { className: 'extra' }));

    expect(html).toContain('extra');
  });

  it('passes BoxTitle and BoxContent internal props when hasSwitch is true', () => {
    const html = renderToString(
      createElement(
        Box,
        { hasSwitch: true, defaultOpen: true },
        createElement(BoxTitle, null, 'Title'),
        createElement(BoxContent, null, 'Content')
      )
    );

    expect(html).toContain('data-slot="box-title"');
    expect(html).toContain('data-slot="box-content"');
    expect(html).toContain('Title');
    expect(html).toContain('Content');
  });

  it('renders switch in title when hasSwitch is true', () => {
    const html = renderToString(
      createElement(
        Box,
        { hasSwitch: true },
        createElement(BoxTitle, null, 'Toggle'),
        createElement(BoxContent, null, 'Body')
      )
    );

    expect(html).toContain('data-slot="switch"');
  });

  it('does not render switch when hasSwitch is false', () => {
    const html = renderToString(
      createElement(
        Box,
        null,
        createElement(BoxTitle, null, 'Title'),
        createElement(BoxContent, null, 'Body')
      )
    );

    expect(html).not.toContain('data-slot="switch"');
  });

  it('renders non-Box children without injecting props', () => {
    const html = renderToString(
      createElement(
        Box,
        null,
        createElement('span', { 'data-testid': 'raw' }, 'raw child')
      )
    );

    expect(html).toContain('raw child');
  });
});

describe('BoxTitle', () => {
  it('renders with data-slot', () => {
    const html = renderToString(createElement(BoxTitle, null, 'My Title'));

    expect(html).toContain('data-slot="box-title"');
    expect(html).toContain('My Title');
  });
});

describe('BoxContent', () => {
  it('renders without switch mode', () => {
    const html = renderToString(
      createElement(BoxContent, null, 'Simple content')
    );

    expect(html).toContain('data-slot="box-content"');
    expect(html).toContain('Simple content');
  });

  it('renders with collapsible grid when hasSwitch is true and open', () => {
    const html = renderToString(
      createElement(
        Box,
        { hasSwitch: true, defaultOpen: true },
        createElement(BoxContent, null, 'Expandable')
      )
    );

    expect(html).toContain('grid-rows-[1fr]');
    expect(html).toContain('Expandable');
  });

  it('renders collapsed when hasSwitch is true and defaultOpen is false', () => {
    const html = renderToString(
      createElement(
        Box,
        { hasSwitch: true, defaultOpen: false },
        createElement(BoxContent, null, 'Hidden')
      )
    );

    expect(html).toContain('grid-rows-[0fr]');
    expect(html).toContain('invisible');
  });
});
