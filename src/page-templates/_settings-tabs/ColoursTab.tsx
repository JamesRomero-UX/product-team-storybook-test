// Settings → Colours tab
//
// Mirrors pages/settings/tabs/colours/Tab.tsx +
// ColourPaletteForm.tsx + ColourPaletteFormFields.tsx.
//
// Production renders:
//   <TabHeader>{t('colours.form_title')}</TabHeader>
//   <ColourPaletteForm values={{ colours }} onSave={onSave} />
//
// The form wraps `ControlledColourInput` — a grid of colour swatches
// with hex picker / preview / delete. Default palette is the
// `genericChartColours` array from packages/components/src/utils/colours.ts
// (Cloudscape recommended categorical palette).
//
// We use simple `<input type='color'>` swatches in a 4-column grid
// instead of lifting ControlledColourInput (which depends on
// react-hook-form context, react-colorful, and the full
// CustomisableForm stack).

import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { Trash02, Plus } from '@untitled-ui/icons-react';
import { useState } from 'react';

// Production default palette (cloudscape categorical) verbatim from
// packages/components/src/utils/colours.ts → genericChartColours.
const DEFAULT_PALETTE: string[] = [
  '#079589', // = theme.colors.teal
  '#C33D69',
  '#688AE8',
  '#8456CE',
  '#E07941',
  '#3759CE',
  '#962249',
  '#096F64',
  '#6237A7',
  '#A84401',
  '#273EA5',
  '#780D35',
  '#03524A',
  '#4A238B',
  '#7E3103',
  '#1B2B88',
];

const Swatch = ({
  hex,
  onChange,
  onRemove,
}: {
  hex: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) => (
  <div
    className={
      'flex items-center gap-3 p-3 rounded-md border-[0.5px] border-solid border-grey200 bg-white'
    }
  >
    <label
      className={
        'w-10 h-10 rounded-md border-[0.5px] border-solid border-grey200 cursor-pointer overflow-hidden flex-shrink-0'
      }
      style={{ backgroundColor: hex }}
    >
      <input
        type={'color'}
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className={'opacity-0 w-full h-full cursor-pointer'}
      />
    </label>
    <div className={'flex-1 min-w-0'}>
      <input
        type={'text'}
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className={
          'w-full font-mono text-sm text-grey800 bg-transparent border-0 outline-none'
        }
      />
    </div>
    <button
      type={'button'}
      onClick={onRemove}
      aria-label={'Remove colour'}
      className={
        'p-1.5 rounded text-grey500 hover:text-grey800 hover:bg-grey100 cursor-pointer bg-transparent border-0'
      }
    >
      <Trash02 width={16} height={16} />
    </button>
  </div>
);

const ColoursTab = () => {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);

  const updateAt = (idx: number, value: string) =>
    setPalette((prev) => prev.map((c, i) => (i === idx ? value : c)));

  const removeAt = (idx: number) =>
    setPalette((prev) => prev.filter((_, i) => i !== idx));

  const addColour = () =>
    setPalette((prev) =>
      prev.length < 16 ? [...prev, '#999999'] : prev,
    );

  return (
    <SpaceBetween size={'m'}>
      <TabHeader>{'Colour palette'}</TabHeader>

      <div className={'text-grey600 text-sm'}>
        {
          'Up to 16 colours used for charts and visualisations across the platform.'
        }
      </div>

      <div className={'grid grid-cols-4 gap-3'}>
        {palette.map((hex, idx) => (
          <Swatch
            key={`${idx}-${hex}`}
            hex={hex}
            onChange={(v) => updateAt(idx, v)}
            onRemove={() => removeAt(idx)}
          />
        ))}
      </div>

      <div>
        <Button
          disabled={palette.length >= 16}
          onClick={addColour}
          iconAlign={'left'}
          iconSvg={<Plus width={16} height={16} />}
        >
          {'Add colour'}
        </Button>
      </div>

      <SpaceBetween direction={'horizontal'} size={'xs'}>
        <Button variant={'primary'}>{'Save'}</Button>
        <Button>{'Cancel'}</Button>
      </SpaceBetween>
    </SpaceBetween>
  );
};

export default ColoursTab;
