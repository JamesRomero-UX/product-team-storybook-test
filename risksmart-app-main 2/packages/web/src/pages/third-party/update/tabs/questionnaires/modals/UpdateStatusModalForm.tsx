import Alert from '@risk-smart/themed-cloudscape-components/alert';
import { Third_Party_Response_Enum_Action } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledSelect from 'src/components/form/controlled-select';
import { ControlledSwitch } from 'src/components/form/controlled-switch/ControlledSwitch';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';

import type { UpdateStatusSchemaFields } from './schema';
import { translationKeyMap } from './schema';
import { RequestTypeOptions } from './schema';

type Props = {
  action: Third_Party_Response_Enum_Action;
};

export const UpdateStatusModalForm: FC<Props> = ({ action }) => {
  const translationKey = translationKeyMap[action];
  const { control, watch } = useFormContext<UpdateStatusSchemaFields>();
  const { t: rt } = useTranslation('common', {
    keyPrefix: 'third_party_responses.updateStatus',
  });

  const shareWithRespondents = watch('ShareWithRespondents');
  const shareWithRespondentsLabel = shareWithRespondents
    ? rt(`${translationKey}.shareWithRespondentsOnInfo`)
    : rt(`${translationKey}.shareWithRespondentsOffInfo`);

  const requestTypeOptions = [
    {
      label: '-',
      value: '',
    },
    ...Object.entries(RequestTypeOptions).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  return (
    <>
      <ConditionalField
        key={'RequestType'}
        condition={
          action === Third_Party_Response_Enum_Action.RequestMoreInformation
        }
      >
        <ControlledSelect
          testId={'requestType'}
          name={'RequestType'}
          label={'Request type'}
          control={control}
          defaultRequired={true}
          options={requestTypeOptions}
        />
      </ConditionalField>
      <ConditionalField
        key={'Reason'}
        condition={action !== Third_Party_Response_Enum_Action.Approve}
      >
        <ControlledTextarea
          name={'Reason'}
          label={'Reason'}
          control={control}
          defaultRequired={false}
          forceRequired={false}
        />
      </ConditionalField>
      {shareWithRespondentsLabel ? null : <div className={'mt-4'} />}
      <ControlledSwitch
        control={control}
        label={'Share with respondents'}
        name={'ShareWithRespondents'}
        defaultRequired={true}
      />
      {shareWithRespondentsLabel ? (
        <Alert type={'info'}>{shareWithRespondentsLabel}</Alert>
      ) : null}
    </>
  );
};
