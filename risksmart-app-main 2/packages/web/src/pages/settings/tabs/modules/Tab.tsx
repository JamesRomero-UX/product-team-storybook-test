import { useMutation } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { getModuleConfigValue } from '@risksmart-app/modules/src/index';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Appetite_Model_Enum,
  DeleteIngestionConfigDocument,
  InsertIngestionConfigDocument,
  Risk_Scoring_Model_Enum,
  UpdateIngestionConfigDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { type FC, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header/TabHeader';
import TabSettingsModal from 'src/components/tab-settings-modal/TabSettingsModal';
import { useModules } from 'src/context/moduleContext';
import { useGetIngestionConfigs } from 'src/hooks/queries/ingestion-config/useGetIngestionConfigs';
import { z } from 'zod';

import { evictField } from '@/utils/graphqlUtils';

import ModuleSettings from './ModuleSettings';

type ModuleSettingsForm = {
  RiskScoringModel: Risk_Scoring_Model_Enum;
  RiskScoringModelConfig: string;
  AppetiteCascadingModel: Appetite_Model_Enum;
  AppetiteCascadingModelConfig: string;
  IngestionConfig: string;
  IngestionApiKey: string;
};

const Tab: FC = () => {
  const {
    modules,
    toggle,
    commit,
    loading,
    isDirty,
    reset,
    setConfig,
    isModuleEnabled,
  } = useModules();
  const [showTabSettings, setShowTabSettings] = useState(false);
  const [tabSettingsParentType, setTabSettingsParentType] = useState<
    Parent_Type_Enum | undefined
  >();
  const { t } = useTranslation('common', { keyPrefix: 'modules' });
  const { t: ct } = useTranslation('common');

  const { data: ingestionConfigData } = useGetIngestionConfigs({
    queryArgs: {},
  });
  const existingIngestionConfig = ingestionConfigData?.ingestion_config?.[0];

  const [insertIngestionConfig] = useMutation(InsertIngestionConfigDocument, {
    update: (cache) => evictField(cache, 'ingestion_config'),
  });
  const [updateIngestionConfig] = useMutation(UpdateIngestionConfigDocument, {
    update: (cache) => evictField(cache, 'ingestion_config'),
  });
  const [deleteIngestionConfig] = useMutation(DeleteIngestionConfigDocument, {
    update: (cache) => evictField(cache, 'ingestion_config'),
  });

  const methods = useForm<ModuleSettingsForm>({
    defaultValues: {
      RiskScoringModel: Risk_Scoring_Model_Enum.Default,
      RiskScoringModelConfig: '{}',
      AppetiteCascadingModel: Appetite_Model_Enum.Default,
      AppetiteCascadingModelConfig: '{}',
      IngestionConfig: '{}',
      IngestionApiKey: '',
    },
    values: {
      RiskScoringModel: getModuleConfigValue(
        modules.risk?.subModules?.risk_scoring,
        {
          key: 'RiskScoringModel',
          schema: z.nativeEnum(Risk_Scoring_Model_Enum),
          defaultValue: Risk_Scoring_Model_Enum.Default,
        }
      ),
      RiskScoringModelConfig: getModuleConfigValue(
        modules.risk?.subModules?.risk_scoring,
        {
          key: 'RiskScoringModelConfig',
          schema: z.string(),
          defaultValue: '{}',
        }
      ),
      AppetiteCascadingModel: getModuleConfigValue(
        modules.risk?.subModules?.appetite_cascading,
        {
          key: 'AppetiteCascadingModel',
          schema: z.nativeEnum(Appetite_Model_Enum),
          defaultValue: Appetite_Model_Enum.Default,
        }
      ),
      AppetiteCascadingModelConfig: getModuleConfigValue(
        modules.risk?.subModules?.appetite_cascading,
        {
          key: 'AppetiteCascadingModelConfig',
          schema: z.string(),
          defaultValue: '{}',
        }
      ),
      IngestionConfig: existingIngestionConfig?.IngestionConfig
        ? JSON.stringify(existingIngestionConfig.IngestionConfig, null, 2)
        : '{}',
      IngestionApiKey: '',
    },
  });

  const saveChanges = async () => {
    const {
      RiskScoringModel,
      RiskScoringModelConfig,
      AppetiteCascadingModel,
      AppetiteCascadingModelConfig,
      IngestionConfig,
      IngestionApiKey,
    } = methods.getValues();
    setConfig('risk.subModules.risk_scoring', {
      RiskScoringModel,
      RiskScoringModelConfig,
    });
    setConfig('risk.subModules.appetite_cascading', {
      AppetiteCascadingModel,
      AppetiteCascadingModelConfig,
    });
    await commit({
      RiskScoringModel,
      RiskScoringModelConfig,
      AppetiteCascadingModel,
      AppetiteCascadingModelConfig,
    });

    const regFeedEnabled = isModuleEnabled('obligation.subModules.reg_feed');

    if (regFeedEnabled) {
      const parsedConfig = JSON.parse(IngestionConfig);
      if (existingIngestionConfig) {
        await updateIngestionConfig({
          variables: {
            object: {
              Id: existingIngestionConfig.Id,
              IngestionConfig: parsedConfig,
              OriginalTimestamp: existingIngestionConfig.ModifiedAtTimestamp,
              ApiKey: IngestionApiKey || undefined,
            },
          },
        });
      } else {
        await insertIngestionConfig({
          variables: {
            object: {
              IngestionConfig: parsedConfig,
              ApiKey: IngestionApiKey || undefined,
            },
          },
        });
      }
    } else if (existingIngestionConfig) {
      await deleteIngestionConfig({
        variables: {
          object: {
            Id: existingIngestionConfig.Id,
          },
        },
      });
    }
  };

  const settings = _.map(modules, (v, k) => (
    <ModuleSettings
      key={k}
      moduleId={k}
      enabled={v.enabled}
      toggleItem={toggle}
      setShowTabSettings={setShowTabSettings}
      setTabSettingsParentType={setTabSettingsParentType}
      subModules={v.subModules}
      allowTabConfig={v.allowTabConfig}
      isDirty={isDirty}
    />
  ));

  return (
    <div>
      <TabHeader className={'py-6'}>{t('tab_title')}</TabHeader>
      {isDirty && (
        <Alert type={'info'} dismissible={true}>
          {t('unsaved_changes')}
        </Alert>
      )}
      <FormProvider {...methods}>{...settings}</FormProvider>
      <TabSettingsModal
        isVisible={showTabSettings}
        onDismiss={() => setShowTabSettings(false)}
        parentType={tabSettingsParentType}
        isOrgLevel={true}
      />
      <div
        className={
          'gap-2 border-0 border-grey150 border-solid border-t-[0.5px] pt-4'
        }
      >
        <SpaceBetween direction={'horizontal'} size={'s'}>
          <Button variant={'primary'} onClick={saveChanges} loading={loading}>
            {ct('save')}
          </Button>
          <Button onClick={() => reset}>{ct('cancel')}</Button>
        </SpaceBetween>
      </div>
    </div>
  );
};

export default Tab;
