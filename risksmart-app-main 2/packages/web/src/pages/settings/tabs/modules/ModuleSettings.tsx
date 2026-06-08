import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import Link from '@risksmart-app/components/src/link';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Edit02 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { BasicModule } from 'src/context/moduleContext';

import SubModuleSettings from './SubmoduleSettings';

const ModuleSettings: FC<{
  moduleId: string;
  enabled: boolean;
  toggleItem: (id: string) => void;
  setShowTabSettings: (show: boolean) => void;
  setTabSettingsParentType: (type: Parent_Type_Enum | undefined) => void;
  subModules?: Record<string, BasicModule>;
  allowTabConfig?: boolean;
  isDirty?: boolean;
}> = ({
  moduleId,
  enabled,
  toggleItem,
  setShowTabSettings,
  setTabSettingsParentType,
  subModules,
  allowTabConfig,
  isDirty,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'modules' });

  return (
    <div
      key={moduleId}
      className={
        'flex border-0 border-grey150 border-solid border-t-[0.5px] !p-4'
      }
    >
      <div>
        <Toggle
          checked={enabled}
          onChange={() => toggleItem(moduleId)}
          ariaLabel={`Toggle ${moduleId}`}
        />
      </div>
      <div className={'ml-[16px] text-left w-full'}>
        <h3 className={'mt-0'}>
          {/* @ts-ignore */}
          {t(`titles.${moduleId}`)}
        </h3>
        {/* @ts-ignore */}
        <p>{t(`descriptions.${moduleId}`)}</p>
        {enabled && (
          <>
            {allowTabConfig && !isDirty && (
              <>
                <h4>{t('configuration')}</h4>
                <Link
                  onClick={() => {
                    setTabSettingsParentType(moduleId as Parent_Type_Enum);
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
            {subModules && (
              <SubModuleSettings
                subModules={subModules}
                toggleItem={toggleItem}
                moduleId={moduleId}
                setShowTabSettings={setShowTabSettings}
                setTabSettingsParentType={setTabSettingsParentType}
                isDirty={isDirty}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleSettings;
