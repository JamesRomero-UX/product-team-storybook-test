import type { ButtonDropdownProps } from '@risk-smart/themed-cloudscape-components/button-dropdown';
import ButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { PromptId } from '@risksmart-app/shared/ai/PromptId';
import { Stars02 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostInferenceCommand } from 'src/data/rest/usePostInferenceCommand';
import OrgFeatureFlaggedRoute from 'src/rbac/OrgFeatureFlaggedRoute';

import { handleError } from '@/utils/errorUtils';

import styles from './style.module.scss';

interface props {
  bodyText: string;
  onChange: (value: string) => void;
  additionalPrompts?: [{ id: PromptId; text: string; altPromptText?: string }];
}

const TextInferenceItem: FC<props> = (p) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'textInference' });
  const postInferenceCommand = usePostInferenceCommand();
  const { addNotification } = useNotifications();
  const [textValue, setState] = useState(p.bodyText);
  const [loading, setLoading] = useState(false);
  const undoEnabled = textValue !== p.bodyText;

  const languageOptions: ButtonDropdownProps.Items = [
    { id: PromptId.TranslateToEnglish, text: t('language.english') },
    { id: PromptId.TranslateToFrench, text: t('language.french') },
    { id: PromptId.TranslateToGerman, text: t('language.german') },
    { id: PromptId.TranslateToSpanish, text: t('language.spanish') },
    { id: PromptId.TranslateToItalian, text: t('language.italian') },
    { id: PromptId.TranslateToPortuguese, text: t('language.portuguese') },
    {
      id: PromptId.TranslateToBrazilianPortuguese,
      text: t('language.brazilianPortuguese'),
    },
  ];

  const generalOptions: ButtonDropdownProps.Items = [
    ...(p.additionalPrompts ?? []),
    {
      id: PromptId.ImproveWriting,
      text: t('general.improveWriting'),
    },
    {
      id: PromptId.FixSpellingAndGrammar,
      text: t('general.fixSpellingAndGrammar'),
    },
    { id: PromptId.UseSimplerLanguage, text: t('general.useSimplerLanguage') },

    { id: PromptId.MakeMoreConcise, text: t('general.makeMoreConcise') },
    { id: PromptId.MakeLonger, text: t('general.makeLonger') },
  ];

  const getInference = async (prompt: string, bodyText: string) => {
    try {
      setLoading(true);
      const response = await postInferenceCommand(prompt, bodyText);
      if (response.returnedText) {
        setState(bodyText);
        p.onChange(response.returnedText);
      } else if (response.error) {
        addNotification({
          type: 'error',
          content: response.message,
        });
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrgFeatureFlaggedRoute fallback={<></>} featureFlag={'bedrock'}>
      <ButtonDropdown
        {...{ className: styles.textInferenceButton }}
        loading={loading}
        items={[
          ...generalOptions,
          {
            id: 'undo',
            text: t('undo'),
            disabled: !undoEnabled,
          },
          {
            id: 'translate',
            text: t('translate'),
            items: languageOptions,
          },
        ]}
        ariaLabel={t('help')}
        variant={'primary'}
        expandToViewport
        onItemClick={(e) => {
          if (e.detail.id === 'undo') {
            p.onChange(textValue);

            return;
          }
          const additionalPrompt = p.additionalPrompts?.find(
            (ad) => ad.id === e.detail.id
          );

          getInference(
            e.detail.id,
            additionalPrompt?.altPromptText ?? p.bodyText
          );
        }}
      >
        <Stars02 />
      </ButtonDropdown>
    </OrgFeatureFlaggedRoute>
  );
};

export default TextInferenceItem;
