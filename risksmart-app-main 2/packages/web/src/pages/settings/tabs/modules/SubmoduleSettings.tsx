import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import Link from '@risksmart-app/components/src/link';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Edit02 } from '@untitled-ui/icons-react';
import _ from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BasicModule } from 'src/context/moduleContext';

import { AppetiteCascadingSettings } from './AppetiteCascadingSettings';
import { IngestionConfigSettings } from './IngestionConfigSettings';
import { RiskScoreSettings } from './RiskScoreSettings';

const SubModuleSettings: FC<{
  subModules?: Record<string, BasicModule>;
  toggleItem: (id: string) => void;
  setShowTabSettings: (show: boolean) => void;
  setTabSettingsParentType: (type: Parent_Type_Enum | undefined) => void;
  moduleId: string;
  isDirty?: boolean;
}> = ({
  subModules,
  toggleItem,
  moduleId,
  setShowTabSettings,
  setTabSettingsParentType,
  isDirty,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'modules' });

  return (
    <>
      <h4>{t('submodules_title')}</h4>
      {_.map(subModules, (subModule: BasicModule, subKey) => {
        return (
          <div
            key={subKey}
            className={
              'flex border-0 border-grey150 border-solid border-t-[0.5px] pt-4'
            }
          >
            <div>
              <Toggle
                checked={subModule.enabled}
                onChange={() => toggleItem(`${moduleId}.subModules.${subKey}`)}
                ariaLabel={`Toggle ${subKey}`}
              />
            </div>
            <div className={'ml-[8px]'}>
              <h4 className={'my-0'}>
                {/* @ts-ignore */}
                {t(`titles.${subKey}`)}
              </h4>
              {/* @ts-ignore */}
              <p>{t(`descriptions.${subKey}`)}</p>
              {subKey === 'risk_scoring' && subModule.enabled && (
                <RiskScoreSettings />
              )}
              {subKey === 'appetite_cascading' && subModule.enabled && (
                <AppetiteCascadingSettings />
              )}
              {subKey === 'reg_feed' && subModule.enabled && (
                <IngestionConfigSettings />
              )}
              {subModule.allowTabConfig && !isDirty && (
                <>
                  <h4>{t('configuration')}</h4>
                  <Link
                    onClick={() => {
                      setTabSettingsParentType(subKey as Parent_Type_Enum);
                      setShowTabSettings(true);
                    }}
                  >
                    <div className={'flex items-center gap-2'}>
                      <Edit02 width={16} />
                      <span>{t('edit_tabs')}</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default SubModuleSettings;
