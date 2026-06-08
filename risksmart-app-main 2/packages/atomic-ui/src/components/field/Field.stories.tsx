import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Input } from '../input';
import { Switch } from '../switch';
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

/**
 * `Field` composes a label, input, optional description, and error message
 * into a single accessible unit. Use `FieldGroup` to stack multiple fields,
 * and `FieldSet` / `FieldLegend` to group related fields under a heading.
 */
const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['wip'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single field with label and text input — the most common use case. */
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor={'title'}>{'Title'}</FieldLabel>
      <Input id={'title'} placeholder={'Enter a title…'} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Title')).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText('Enter a title…')
    ).toBeInTheDocument();
  },
};

/** An invalid field, styled with `data-invalid`. */
export const Invalid: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor={'title'}>{'Title'}</FieldLabel>
      <Input id={'title'} placeholder={'Enter a title…'} aria-invalid={true} />
      <FieldError errors={[{ message: 'This field is required' }]} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'This field is required'
    );
  },
};

/** FieldSet with FieldLegend groups related fields under a heading. */
export const WithFieldSet: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>{'Personal details'}</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={'first-name'}>{'First name'}</FieldLabel>
          <Input id={'first-name'} placeholder={'Jane'} />
        </Field>
        <Field>
          <FieldLabel htmlFor={'last-name'}>{'Last name'}</FieldLabel>
          <Input id={'last-name'} placeholder={'Doe'} />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Personal details')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Jane')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Doe')).toBeInTheDocument();
  },
};

/** FieldLegend with label variant for smaller headings. */
export const LegendLabelVariant: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend variant={'label'}>{'Settings'}</FieldLegend>
      <Field>
        <FieldLabel htmlFor={'setting'}>{'Option'}</FieldLabel>
        <Input id={'setting'} placeholder={'Value'} />
      </Field>
    </FieldSet>
  ),
};

/** Horizontal layout with FieldContent for description alongside a control. */
export const HorizontalWithContent: Story = {
  render: () => (
    <FieldGroup>
      <Field orientation={'horizontal'}>
        <FieldContent>
          <FieldTitle>{'Enable notifications'}</FieldTitle>
          <FieldDescription>
            {'Receive email alerts for important events'}
          </FieldDescription>
        </FieldContent>
        <Switch aria-label={'Enable notifications'} />
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Enable notifications')).toBeInTheDocument();
    await expect(
      canvas.getByText('Receive email alerts for important events')
    ).toBeInTheDocument();
  },
};

/** Responsive orientation adapts from vertical to horizontal at wider widths. */
export const ResponsiveOrientation: Story = {
  render: () => (
    <FieldGroup>
      <Field orientation={'responsive'}>
        <FieldContent>
          <FieldTitle>{'Dark mode'}</FieldTitle>
          <FieldDescription>{'Toggle the application theme'}</FieldDescription>
        </FieldContent>
        <div>
          <Switch aria-label={'Dark mode'} />
        </div>
      </Field>
    </FieldGroup>
  ),
};

/** FieldSeparator divides fields with an optional label. */
export const WithSeparator: Story = {
  render: () => (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={'email'}>{'Email'}</FieldLabel>
        <Input id={'email'} placeholder={'user@example.com'} />
      </Field>
      <FieldSeparator>{'or'}</FieldSeparator>
      <Field>
        <FieldLabel htmlFor={'phone'}>{'Phone'}</FieldLabel>
        <Input id={'phone'} placeholder={'+1 555 123 4567'} />
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('or')).toBeInTheDocument();
    await expect(canvas.getAllByRole('separator')).toHaveLength(1);
  },
};

/** FieldSeparator without children renders just a line. */
export const SeparatorWithoutLabel: Story = {
  render: () => (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={'a'}>{'Field A'}</FieldLabel>
        <Input id={'a'} />
      </Field>
      <FieldSeparator />
      <Field>
        <FieldLabel htmlFor={'b'}>{'Field B'}</FieldLabel>
        <Input id={'b'} />
      </Field>
    </FieldGroup>
  ),
};

/** FieldError with multiple errors renders a list. */
export const MultipleErrors: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor={'password'}>{'Password'}</FieldLabel>
      <Input id={'password'} aria-invalid={true} />
      <FieldError
        errors={[
          { message: 'Must be at least 8 characters' },
          { message: 'Must contain a number' },
          { message: 'Must contain a special character' },
        ]}
      />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toBeInTheDocument();
    await expect(
      canvas.getByText('Must be at least 8 characters')
    ).toBeInTheDocument();
    await expect(canvas.getByText('Must contain a number')).toBeInTheDocument();
  },
};

/** FieldError with children overrides the errors prop. */
export const ErrorWithChildren: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor={'name'}>{'Name'}</FieldLabel>
      <Input id={'name'} aria-invalid={true} />
      <FieldError>{'Custom error content'}</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Custom error content')).toBeInTheDocument();
  },
};

/** FieldError with no errors and no children renders nothing. */
export const NoErrors: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor={'ok'}>{'Valid field'}</FieldLabel>
      <Input id={'ok'} />
      <FieldError />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

/** FieldError deduplicates identical error messages. */
export const DuplicateErrors: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor={'dup'}>{'Field'}</FieldLabel>
      <Input id={'dup'} aria-invalid={true} />
      <FieldError
        errors={[
          { message: 'Required' },
          { message: 'Required' },
          { message: 'Too short' },
        ]}
      />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toBeInTheDocument();
    // Duplicates should be deduplicated, showing both unique messages in a list
    await expect(canvas.getByText('Required')).toBeInTheDocument();
    await expect(canvas.getByText('Too short')).toBeInTheDocument();
  },
};
