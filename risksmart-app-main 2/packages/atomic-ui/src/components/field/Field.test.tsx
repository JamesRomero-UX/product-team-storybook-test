import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './index';

describe('FieldSet', () => {
  it('renders a fieldset with data-slot', () => {
    const html = renderToString(
      createElement(FieldSet, null, createElement('span', null, 'content'))
    );

    expect(html).toContain('data-slot="field-set"');
    expect(html).toContain('content');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(FieldSet, { className: 'custom-class' })
    );

    expect(html).toContain('custom-class');
  });
});

describe('FieldLegend', () => {
  it('renders a legend with default variant', () => {
    const html = renderToString(createElement(FieldLegend, null, 'My Legend'));

    expect(html).toContain('data-slot="field-legend"');
    expect(html).toContain('data-variant="legend"');
    expect(html).toContain('My Legend');
  });

  it('renders with label variant', () => {
    const html = renderToString(
      createElement(FieldLegend, { variant: 'label' }, 'Label Legend')
    );

    expect(html).toContain('data-variant="label"');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(FieldLegend, { className: 'extra' })
    );

    expect(html).toContain('extra');
  });
});

describe('FieldGroup', () => {
  it('renders a div with data-slot', () => {
    const html = renderToString(
      createElement(FieldGroup, null, createElement('span', null, 'child'))
    );

    expect(html).toContain('data-slot="field-group"');
    expect(html).toContain('child');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(FieldGroup, { className: 'my-group' })
    );

    expect(html).toContain('my-group');
  });
});

describe('Field', () => {
  it('renders with default vertical orientation', () => {
    const html = renderToString(
      createElement(Field, null, createElement('span', null, 'field'))
    );

    expect(html).toContain('data-slot="field"');
    expect(html).toContain('data-orientation="vertical"');
    expect(html).toContain('role="group"');
    expect(html).toContain('field');
  });

  it('renders with horizontal orientation', () => {
    const html = renderToString(
      createElement(Field, { orientation: 'horizontal' })
    );

    expect(html).toContain('data-orientation="horizontal"');
  });

  it('renders with responsive orientation', () => {
    const html = renderToString(
      createElement(Field, { orientation: 'responsive' })
    );

    expect(html).toContain('data-orientation="responsive"');
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(Field, { className: 'field-extra' })
    );

    expect(html).toContain('field-extra');
  });
});

describe('FieldContent', () => {
  it('renders with data-slot', () => {
    const html = renderToString(createElement(FieldContent, null, 'inner'));

    expect(html).toContain('data-slot="field-content"');
    expect(html).toContain('inner');
  });
});

describe('FieldLabel', () => {
  it('renders a label with data-slot', () => {
    const html = renderToString(createElement(FieldLabel, null, 'My Label'));

    expect(html).toContain('data-slot="field-label"');
    expect(html).toContain('My Label');
  });
});

describe('FieldTitle', () => {
  it('renders with data-slot', () => {
    const html = renderToString(createElement(FieldTitle, null, 'Title'));

    expect(html).toContain('data-slot="field-label"');
    expect(html).toContain('Title');
  });
});

describe('FieldDescription', () => {
  it('renders a paragraph with data-slot', () => {
    const html = renderToString(
      createElement(FieldDescription, null, 'Help text')
    );

    expect(html).toContain('data-slot="field-description"');
    expect(html).toContain('Help text');
  });
});

describe('FieldSeparator', () => {
  it('renders without children', () => {
    const html = renderToString(createElement(FieldSeparator));

    expect(html).toContain('data-slot="field-separator"');
    expect(html).toContain('data-content="false"');
  });

  it('renders with children content', () => {
    const html = renderToString(createElement(FieldSeparator, null, 'or'));

    expect(html).toContain('data-content="true"');
    expect(html).toContain('data-slot="field-separator-content"');
    expect(html).toContain('or');
  });
});

describe('FieldError', () => {
  it('renders children when provided', () => {
    const html = renderToString(
      createElement(FieldError, null, 'Something went wrong')
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('data-slot="field-error"');
    expect(html).toContain('Something went wrong');
  });

  it('renders nothing when no children and no errors', () => {
    const html = renderToString(createElement(FieldError));

    expect(html).toBe('');
  });

  it('renders nothing when errors array is empty', () => {
    const html = renderToString(createElement(FieldError, { errors: [] }));

    expect(html).toBe('');
  });

  it('renders single error message directly', () => {
    const html = renderToString(
      createElement(FieldError, {
        errors: [{ message: 'Required field' }],
      })
    );

    expect(html).toContain('Required field');
    expect(html).not.toContain('<ul');
  });

  it('renders multiple errors as a list', () => {
    const html = renderToString(
      createElement(FieldError, {
        errors: [
          { message: 'Too short' },
          { message: 'Must contain a number' },
        ],
      })
    );

    expect(html).toContain('<ul');
    expect(html).toContain('Too short');
    expect(html).toContain('Must contain a number');
  });

  it('deduplicates errors with the same message', () => {
    const html = renderToString(
      createElement(FieldError, {
        errors: [{ message: 'Required' }, { message: 'Required' }],
      })
    );

    expect(html).toContain('Required');
    expect(html).not.toContain('<ul');
  });

  it('handles undefined entries in errors array', () => {
    const html = renderToString(
      createElement(FieldError, {
        errors: [undefined, { message: 'Error' }],
      })
    );

    expect(html).toContain('Error');
  });

  it('prefers children over errors prop', () => {
    const html = renderToString(
      createElement(
        FieldError,
        { errors: [{ message: 'From errors' }] },
        'From children'
      )
    );

    expect(html).toContain('From children');
    expect(html).not.toContain('From errors');
  });
});
