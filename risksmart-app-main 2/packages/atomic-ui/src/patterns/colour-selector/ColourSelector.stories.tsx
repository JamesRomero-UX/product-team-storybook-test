import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import {
  ColourSelector,
  ColourSelectorCustom,
  ColourSelectorItem,
} from './index';

/**
 * A row of colour swatches where exactly one can be selected at a time.
 * Each swatch requires a `color` (CSS color value) and accessible `label`.
 */
const meta = {
  title: 'Patterns/ColourSelector',
  component: ColourSelector,
  subcomponents: { ColourSelectorItem, ColourSelectorCustom },
  argTypes: {
    defaultValue: {
      description:
        "The initially selected swatch value(s). Pass the `label` of the swatch as a single-element array, e.g. `['Green']`.",
      control: false,
    },
    onValueChange: {
      description:
        'Callback fired when the selected swatch changes. Receives `string[]` — read `value[0]` for the selected label.',
    },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof ColourSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const swatches = [
  { color: '#E53E3E', label: 'Red' },
  { color: '#DD6B20', label: 'Orange' },
  { color: '#D69E2E', label: 'Yellow' },
  { color: '#38A169', label: 'Green' },
  { color: '#3182CE', label: 'Blue' },
];

export const Default: Story = {
  render: (args) => (
    <ColourSelector defaultValue={['Green']} {...args}>
      {swatches.map(({ color, label }) => (
        <ColourSelectorItem
          key={label}
          value={label}
          color={color}
          label={label}
        />
      ))}
    </ColourSelector>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const greenSwatch = canvas.getByLabelText('Green');
    const redSwatch = canvas.getByLabelText('Red');

    await expect(greenSwatch).toHaveAttribute('data-pressed');
    await expect(redSwatch).not.toHaveAttribute('data-pressed');

    await userEvent.click(redSwatch);

    await expect(redSwatch).toHaveAttribute('data-pressed');
    await expect(greenSwatch).not.toHaveAttribute('data-pressed');
  },
};

const ColourSelectorCustomWithHooks = () => {
  const [colour, setColour] = useState('#3182CE');

  return <ColourSelectorCustom value={colour} onChange={setColour} />;
};

/**
 * `ColourSelectorCustom` standalone — a free-form colour picker with a hex label.
 * No interaction test: native `<input type="color">` opens a browser dialog that
 * cannot be driven by `userEvent`.
 */
export const Custom: Story = {
  render: () => <ColourSelectorCustomWithHooks />,
};

const CombinedWithHooks = () => {
  const [colour, setColour] = useState('#38A169'); // Green

  const presetLabel = swatches.find((s) => s.color === colour)?.label;
  const selectorValue = presetLabel ? [presetLabel] : [];

  return (
    <div className={cn('flex flex-col gap-4 min-w-[300px]')}>
      <ColourSelector
        value={selectorValue}
        onValueChange={(v) => {
          const label = v[0];
          const swatch = swatches.find((s) => s.label === label);
          if (swatch) {
            setColour(swatch.color);
          }
        }}
      >
        {swatches.map(({ color, label }) => (
          <ColourSelectorItem
            key={label}
            value={label}
            color={color}
            label={label}
          />
        ))}
      </ColourSelector>
      <ColourSelectorCustom value={colour} onChange={setColour} />
    </div>
  );
};

/**
 * The combined preset-swatches + custom-picker pattern used in dialogs such as
 * `EditLevelDialog` and `EditMatrixCellDialog`. When the user picks a colour
 * outside the preset list the swatch group deselects entirely (value = []).
 */
export const Combined: Story = {
  render: () => <CombinedWithHooks />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const greenSwatch = canvas.getByLabelText('Green');
    await expect(greenSwatch).toHaveAttribute('data-pressed');

    const colorInput = canvasElement.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement;

    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    await expect(greenSwatch).not.toHaveAttribute('data-pressed');

    await expect(canvas.getByText('Custom colour: #ff0000')).toBeVisible();
  },
};
