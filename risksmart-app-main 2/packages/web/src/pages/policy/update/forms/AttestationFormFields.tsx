import Header from '@risk-smart/themed-cloudscape-components/header';
import Button from '@risksmart-app/components/src/button';
import Modal from '@risksmart-app/components/src/modal';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserMultiSelect from 'src/components/form/controlled-group-and-user-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledSelect from 'src/components/form/controlled-select';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import FieldGroup from 'src/components/form/form/customisable-form/FieldGroup';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { usePreSaveModalState } from '@/hooks/usePreSaveModalState';

import {
  type AttestationFormFieldData,
  AttestationTimeLimitSchema,
} from './attestationSchema';

export const AttestationFormFields = ({
  totalUsers,
  displayAttestationGroups,
  displayReAttestationRequiredControl,
}: {
  totalUsers: number;
  displayAttestationGroups: boolean;
  displayReAttestationRequiredControl?: boolean;
}) => {
  const { control, formState } = useFormContext<AttestationFormFieldData>();

  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });
  const isDayAttestationsEnabled = useIsFeatureFlagEnabled('day_attestations');

  const attestationTimeLimits = st('attestation_time_limits', {
    returnObjects: true,
  });

  const { visible, onDismiss, onConfirm } = usePreSaveModalState(
    formState.dirtyFields.attestationTimeLimit || totalUsers > 0
  );

  return (
    <>
      <FieldGroup key={'attestationGroup'}>
        <ControlledRadioGroup
          key={'requireAttestationRadio'}
          forceRequired={true}
          items={[
            { value: 'true', label: t('booleanRadio.true') },
            { value: 'false', label: t('booleanRadio.false') },
          ]}
          transform={noTransform}
          name={'requireAttestationFromEveryone'}
          label={st('fields.AttestationTarget')}
          description={st('fields.AttestationTarget_help')}
          control={control}
        />

        <ConditionalField
          key={'attestationGroup'}
          condition={displayAttestationGroups}
        >
          <ControlledGroupAndUserMultiSelect
            includeGroups={true}
            forceRequired={true}
            userFilter={() => false}
            groupFilter={() => true}
            name={'attestationGroups'}
            label={st('fields.AttestationGroups')}
            description={st('fields.AttestationGroups_help')}
            testId={'attestationGroups'}
            control={control}
          />
        </ConditionalField>

        <ConditionalField
          key={'requireReattestationField'}
          condition={displayReAttestationRequiredControl}
        >
          <ControlledRadioGroup
            key={'requireReattestation'}
            forceRequired={true}
            items={[
              { value: 'true', label: t('booleanRadio.true') },
              { value: 'false', label: t('booleanRadio.false') },
            ]}
            transform={noTransform}
            name={'requireReattestation'}
            label={st('fields.AttestationReissue')}
            control={control}
          />
        </ConditionalField>

        <ControlledSelect
          key={'attestationTimeLimit'}
          name={'attestationTimeLimit'}
          label={st('fields.AttestationTimeLimit')}
          description={st('fields.AttestationTimeLimit_help')}
          addEmptyOption
          options={AttestationTimeLimitSchema.options
            .filter(
              // Exclude '1 day' option if the feature flag is not enabled, as this option is only for QA/testing purposes and should not be available to end users.
              (option) => option !== '1 day' || isDayAttestationsEnabled
            )
            .map((option) => ({
              value: option,
              label:
                attestationTimeLimits[
                  option as keyof typeof attestationTimeLimits
                ],
            }))}
          testId={'attestationTimeLimit'}
          control={control}
        />

        <ControlledInput
          key={'attestationPromptText'}
          name={'attestationPromptText'}
          label={st('fields.AttestationPromptText')}
          description={st('fields.AttestationPromptText_help')}
          control={control}
        />
      </FieldGroup>

      {visible && (
        <Modal
          visible={true}
          header={
            <Header>{t('attestations.confirmConfigChangePrompt.title')}</Header>
          }
          onDismiss={onDismiss}
        >
          <p className={'mt-0'}>
            {t('attestations.confirmConfigChangePrompt.message', {
              count: totalUsers,
            })}
          </p>
          <div className={'flex flex-row gap-3'}>
            <Button variant={'primary'} onClick={onConfirm}>
              {t('attestations.confirmConfigChangePrompt.confirm')}
            </Button>
            <Button onClick={onDismiss}>
              {t('attestations.confirmConfigChangePrompt.cancel')}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};
