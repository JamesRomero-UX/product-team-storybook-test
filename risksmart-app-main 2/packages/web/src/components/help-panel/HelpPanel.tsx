import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { HelpPanelProps } from '@risk-smart/themed-cloudscape-components/help-panel';
import HelpPanelDefault from '@risk-smart/themed-cloudscape-components/help-panel';
import Input from '@risk-smart/themed-cloudscape-components/input';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import Link from '../link';
import HelpSection from './HelpSection';
import { useHelpStore } from './useHelpStore';

const HelpPanel: FC<HelpPanelProps> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'help' });
  const {
    hasPermission: canUpdateTaxonomy,
    loading: isLoadingCanUpdateTaxonomy,
  } = useHasPermissionQuery('update:taxonomy');
  const {
    summaryHelpContent,
    formFieldHelpContent,
    contentId,
    setContentId,
    translationKey,
  } = useHelpStore();
  const fieldHtmlContent = contentId ? formFieldHelpContent[contentId] : null;

  return (
    <HelpPanelDefault {...props} header={<h2>{t('title')}</h2>}>
      {!isLoadingCanUpdateTaxonomy && canUpdateTaxonomy && (
        <div className={'mb-4'}>
          <FormField label={t('translation_key')}>
            <Input disabled={true} value={translationKey ?? ''} />
          </FormField>
        </div>
      )}
      {!fieldHtmlContent &&
        summaryHelpContent &&
        summaryHelpContent.map((summary, i) => (
          <HelpSection
            title={summary.title}
            htmlContent={summary.content}
            key={i}
          />
        ))}
      {!!fieldHtmlContent && (
        <>
          <Link onFollow={() => setContentId(null)}>{t('show_all')}</Link>
          <HelpSection
            title={fieldHtmlContent.title}
            htmlContent={fieldHtmlContent.content}
            key={contentId}
          />
        </>
      )}
      {!fieldHtmlContent &&
        formFieldHelpContent &&
        Object.keys(formFieldHelpContent).map((fieldId) => (
          <HelpSection
            title={formFieldHelpContent[fieldId].title}
            htmlContent={formFieldHelpContent[fieldId].content}
            key={fieldId}
          />
        ))}
    </HelpPanelDefault>
  );
};

export default HelpPanel;
