import { useTranslation } from 'react-i18next';
import { toTitleCase } from 'src/utils';

import type { Step } from '../types';

export const useDefaultWizardStepConfiguration = (): Step[] => {
  const { t } = useTranslation('taxonomy');

  return [
    {
      controlType: '',
      description: `Please review the ${t('risk_one')} and make any necessary revisions as appropriate.`,
      showModal: 'false',
      tab: '',
      title: toTitleCase(`Review ${t('risk_one')} details`),
    },
    {
      controlType: '',
      description: `Please review past ${t('risk_one')} ratings and add a new inherent ${t('risk_one')} rating.`,
      showModal: 'false',
      tab: 'ratings',
      title: toTitleCase(`Inherent ${t('risk_one')} rating`),
    },
    {
      controlType: '',
      description: `Please review past ${t('control_other')} and their tests. Add, delete and rate ${t('control_other')} as appropriate.`,
      showModal: 'false',
      tab: 'controls',
      title: toTitleCase(`Rate ${t('control_other')}`),
    },
    {
      controlType: '',
      description: `Please review past ${t('risk_one')} ratings and add a new residual ${t('risk_one')} rating.`,
      showModal: 'false',
      tab: 'ratings',
      title: toTitleCase(`Residual ${t('risk_one')} rating`),
    },
  ];
};
