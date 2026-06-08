import { withJsonFormsControlProps } from '@jsonforms/react';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import { InfoCircle } from '@untitled-ui/icons-react';
import type { FC } from 'react';

import type { ExtendedControlProps } from '../../types';
import { infoIconStyles } from '../../utils';
import Attachments from '../helpers/Attachments';
import style from './style.module.scss';

const BooleanControlUnwrapped: FC<ExtendedControlProps> = ({
  data,
  handleChange,
  label,
  path,
  id,
  enabled,
  schema,
  uischema,
  visible,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className={'pb-6'}>
      <SpaceBetween size={'xs'} direction={'horizontal'}>
        <div className={'flex gap-3 items-center ' + style.booleanCell}>
          <Toggle
            checked={!!data}
            onChange={(ev) => handleChange(path, ev.detail.checked)}
            name={id}
            data-testid={uischema.scope}
            disabled={!enabled}
          >
            {label}
          </Toggle>
          {uischema?.options?.description ? (
            <div className={`flex gap-3 ${style.customisableControl}`}>
              <Popover
                size={'large'}
                dismissButton={false}
                triggerType={'custom'}
                content={uischema.options.description}
              >
                <InfoCircle
                  viewBox={'0 0 24 24'}
                  className={'relative ' + infoIconStyles}
                />
              </Popover>
            </div>
          ) : null}
          <Attachments
            path={path}
            handleChange={handleChange}
            allowAttachments={schema.allowAttachments}
            disabled={!enabled}
          />
        </div>
      </SpaceBetween>
    </div>
  );
};

export const BooleanControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  BooleanControlUnwrapped
);
