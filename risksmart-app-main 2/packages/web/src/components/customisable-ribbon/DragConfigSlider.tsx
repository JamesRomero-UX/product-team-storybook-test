import Slider from '@risk-smart/themed-cloudscape-components/slider';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import { useTranslation } from 'react-i18next';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type Props = {
  bounceDamping: number;
  setBounceDamping: (value: number) => void;
  dragSliderEnabled: boolean;
  setDragSliderEnabled: (value: boolean) => void;
};

const SLIDER_LABELS: Record<string, string> = {
  '1': '🦘',
  '11': '🏀',
  '21': '🎾',
  '31': '🎳',
  '41': '🫠',
};

export const DragConfigSlider = ({
  bounceDamping,
  setBounceDamping,
  dragSliderEnabled,
  setDragSliderEnabled,
}: Props) => {
  const easterEggsEnabled = useIsFeatureFlagEnabled('easter_eggs');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customisableRibbons',
  });

  if (!easterEggsEnabled) {
    return null;
  }

  return (
    <div className={'flex flex-col gap-4 mb-4 justify-end items-end'}>
      <Toggle
        onChange={() => setDragSliderEnabled(!dragSliderEnabled)}
        checked={dragSliderEnabled}
      >
        {t('dragConfigSliderToggleLabel')}
      </Toggle>
      {!dragSliderEnabled ? null : (
        <div className={'flex gap-8 items-center justify-between'}>
          <div className={'text-end'}>
            <h5 className={'font-normal w-[420px] m-0 text-wrap'}>
              {t('dragConfigSliderMessage')}
            </h5>
          </div>
          <Slider
            onChange={({ detail }) => setBounceDamping(detail.value)}
            value={bounceDamping}
            valueFormatter={(value) => SLIDER_LABELS[value.toString()] || ''}
            tickMarks
            step={10}
            max={41}
            min={1}
            referenceValues={[11, 21, 31]}
          />
        </div>
      )}
    </div>
  );
};
