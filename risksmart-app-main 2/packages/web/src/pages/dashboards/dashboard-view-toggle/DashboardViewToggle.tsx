import SegmentedControl from '@risk-smart/themed-cloudscape-components/segmented-control';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '../useDashboardStore';
import styles from './style.module.scss';
import type { DashboardView } from './types';

const DashboardViewToggle: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });
  const { selectedDashboard, setSelectedDashboard } = useDashboardStore();

  return (
    <div className={styles.dashboardViewToggle}>
      <SegmentedControl
        selectedId={selectedDashboard}
        onChange={({ detail }) =>
          setSelectedDashboard(detail.selectedId as DashboardView)
        }
        options={[
          { text: t('overall_toggle'), id: 'dashboard' },
          { text: t('my_items_toggle'), id: 'my-items' },
        ]}
      />
    </div>
  );
};

export default DashboardViewToggle;
