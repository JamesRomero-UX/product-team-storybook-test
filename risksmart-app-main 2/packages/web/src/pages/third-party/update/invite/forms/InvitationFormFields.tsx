import { useQuery } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import {
  GetQuestionnaireTemplatesDocument,
  Questionnaire_Template_Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import { FormField } from 'src/components/form/form/FormField';
import { useGetThirdPartyContacts } from 'src/hooks/queries/third-party/useGetThirdPartyContacts';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { ControlledMultiAutosuggest } from '../../../../../components/form/controlled-multi-autosuggest/ControlledMultiAutosuggest';
import ControlledMultiselect from '../../../../../components/form/controlled-multiselect';
import { useGetCollectionTableProps } from '../../../../questionnaire-templates/config';
import type { QuestionnaireTemplateFields } from '../../../../questionnaire-templates/types';
import { type InvitationFields, invitationSchema } from './invitationSchema';

export const InvitationFormFields = () => {
  const { control, setValue, watch } = useFormContext<InvitationFields>();
  const thirdPartyId = useGetGuidParam('id');
  const [userValue, setUserValue] = useState('');
  const hasContactsEnabled = useIsFeatureFlagEnabled('tpp_contacts');

  const { data, loading } = useQuery(GetQuestionnaireTemplatesDocument, {
    variables: {
      where: {
        versions: {
          Status: { _eq: Questionnaire_Template_Version_Status_Enum.Published },
        },
      },
    },
  });

  const { data: contactsData, loading: contactsLoading } =
    useGetThirdPartyContacts({
      queryArgs: { thirdPartyId },
      shouldSkip: !hasContactsEnabled,
    });

  // Filter to only include active contacts (not revoked AND has logged in)
  const activeContactOptions = useMemo(() => {
    const contacts = contactsData?.third_party_contact ?? [];

    return contacts
      .filter(
        (contact) =>
          !contact.IsRevoked &&
          (contact.user?.LastSeen != null ||
            contact.PasswordSetAtTimestamp != null)
      )
      .map((contact) => ({
        value: contact.Email,
        label: contact.Name
          ? `${contact.Name} (${contact.Email})`
          : contact.Email,
      }));
  }, [contactsData]);

  const users = watch('users');
  const suggestedEmails = useMemo(() => {
    const emailDomains = ['@gmail.com', '@yahoo.com', '@outlook.com'];
    const emailSplit = userValue.split('@');
    const partialUserAddress = emailSplit[0];
    const partialDomain = emailSplit[1];
    if (partialDomain === undefined) {
      return [];
    }

    const suggestedDomains = emailDomains.filter((domain) =>
      domain.toLowerCase().startsWith(`@${partialDomain.toLowerCase()}`)
    );

    return suggestedDomains
      .map((domain) => `${partialUserAddress}${domain}`)
      .map((email) => ({
        value: email,
        label: email,
      }));
  }, [userValue]);

  const versionBidirectionalMap = useMemo(
    () =>
      data?.questionnaire_template.reduce<Record<string, string>>(
        (acc, curr) => {
          acc[curr.Id] = curr.publishedVersion[0]?.Id;

          return acc;
        },
        {}
      ) ?? {},
    [data]
  );

  const tableProps = useGetCollectionTableProps(data?.questionnaire_template);

  const { t } = useTranslation(['common'], {
    keyPrefix: 'plan_questionnaire.fields',
  });
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<
    QuestionnaireTemplateFields[]
  >([]);

  useEffect(() => {
    setValue(
      'questionnaires',
      selectedQuestionnaires.map((q) => versionBidirectionalMap[q.Id])
    );
  }, [selectedQuestionnaires, setValue, versionBidirectionalMap]);

  return (
    <div>
      {hasContactsEnabled ? (
        <ControlledMultiselect
          options={activeContactOptions}
          placeholder={t('users_placeholder')}
          name={'users'}
          label={t('users')}
          control={control}
          statusType={contactsLoading ? 'loading' : 'finished'}
          filteringType={'auto'}
        />
      ) : (
        <ControlledMultiAutosuggest
          onCurrentValueChange={setUserValue}
          options={[...suggestedEmails, ...users]}
          check={(val) =>
            invitationSchema.shape.users.element.shape.value.safeParse(val)
              .success
          }
          placeholder={t('users_placeholder')}
          name={'users'}
          label={t('users')}
          control={control}
        />
      )}

      <ControlledTextarea
        name={'message'}
        label={t('message')}
        placeholder={t('message_placeholder')}
        control={control}
      />
      <FormField
        stretch={true}
        label={t('questionnaires', {
          count: selectedQuestionnaires.length,
          total: data?.questionnaire_template.length ?? 0,
        })}
      >
        <Table
          {...tableProps}
          loading={loading}
          variant={'embedded'}
          selectedItems={selectedQuestionnaires}
          trackBy={'Id'}
          onSelectionChange={({ detail }) => {
            setSelectedQuestionnaires(detail.selectedItems);
          }}
          selectionType={'multi'}
        />
      </FormField>
    </div>
  );
};
