import Box from '@risk-smart/themed-cloudscape-components/box';
import ColumnLayout from '@risk-smart/themed-cloudscape-components/column-layout';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import Button from '@risksmart-app/components/src/button';
import { AlertCircle } from '@untitled-ui/icons-react';
import _ from 'lodash';

/**
 * A popover that displays the changes made to a form field.
 */
export const ChangesPopover = ({
  originalValue,
  newValue,
}: {
  originalValue: string;
  newValue: string;
}) => {
  return (
    <Popover
      data-testid={'field-changes-popover'}
      renderWithPortal
      fixedWidth
      triggerType={'custom'}
      /* TODO: translations */
      header={'Changes'}
      size={'large'}
      content={
        <ColumnLayout columns={2} variant={'text-grid'}>
          <div>
            {/* TODO: translation */}
            <Box variant={'awsui-key-label'}>{'Original Value'}</Box>
            <div data-testid={'original-value'}>{originalValue}</div>
          </div>
          <div>
            {/* TODO: translation */}
            <Box variant={'awsui-key-label'}>{'New Value'}</Box>
            <div data-testid={'new-value'}>{newValue}</div>
          </div>
        </ColumnLayout>
      }
    >
      <span>
        <Button
          iconSvg={
            <span
              className={'grid place-items-center'}
              data-testid={`show-changes-button`}
            >
              <AlertCircle
                viewBox={'0 0 24 24'}
                className={'w-8 h-8 text-[orange] -ml-4'}
              />
            </span>
          }
          variant={'inline-icon'}
        />
      </span>
    </Popover>
  );
};
