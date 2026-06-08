import Link from '@risk-smart/themed-cloudscape-components/link';
import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import Tabs from '@risk-smart/themed-cloudscape-components/tabs';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import Settings01 from '@untitled-ui/icons-react/build/cjs/Settings01';
import { type FC, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import TabSettingsModal from '../tab-settings-modal';
import style from './style.module.scss';

interface ControlledTabsProps extends TabsProps {
  parentType?: Parent_Type_Enum;
  parent?: ObjectWithContributors;
  disableSettings?: boolean;
}

const ControlledTabs: FC<ControlledTabsProps> = (props) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  // Ensure activeTabId is valid or fallback to first available tab
  const availableTabIds = props.tabs?.map((tab) => tab.id) || [];
  const safeActiveTabId =
    props.activeTabId && availableTabIds.includes(props.activeTabId)
      ? props.activeTabId
      : availableTabIds[0];

  return (
    <div className={style.tabs}>
      <Tabs
        {...props}
        activeTabId={safeActiveTabId}
        onChange={(e) => {
          if (e.detail.activeTabHref) {
            navigate(e.detail.activeTabHref, {
              state,
            });
          }
        }}
        actions={
          props.parentType &&
          !props.disableSettings && (
            <Link onClick={() => setShowSettings(true)}>
              <Settings01 className={'pt-[6px]'} />
            </Link>
          )
        }
      />
      <TabSettingsModal
        parentType={props.parentType}
        isVisible={showSettings}
        onDismiss={() => {
          setShowSettings(false);
        }}
        parent={props.parent}
      />
    </div>
  );
};

export default ControlledTabs;
